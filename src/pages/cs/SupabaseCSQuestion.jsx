import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Calculator, Loader2 } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import ScientificCalculator from "@/components/ScientificCalculator";
import { csRecordAttempt, csAddToReviewBank, csWriteMistakeDna } from "@/lib/csTopicStore";
import { base44, supabaseClient } from "@/api/base44Client";
import { PRELOADED_PAIRS } from "@/lib/ingestorQuestions";

const BANK_VERSION = "v4";
const PROGRESS_KEY = (topicKey) => `supabase_q_idx_${BANK_VERSION}_cs_${topicKey}`;

function extractMarksFromText(text) {
  if (!text) return null;
  const m = text.match(/\[(\d+)\]/) ?? text.match(/\((\d+)\s*marks?\)/i);
  return m ? parseInt(m[1], 10) : null;
}

function buildPrompt(questionText, markScheme, totalMarks, answer) {
  return `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: "${questionText}"
Marks available: ${totalMarks}

Mark scheme:
${markScheme}

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Award marks generously but accurately. Respond ONLY in this JSON format, no extra text:
{
  "marks_earned": [number 0 to ${totalMarks}],
  "mark_1": { "earned": true or false, "keyword": "key phrase needed", "found": true or false, "feedback": "one sentence" },
  "mark_2": { "earned": true or false, "keyword": "second key phrase if applicable", "found": true or false, "feedback": "one sentence" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why",
  "next_step": "one sentence telling the student exactly what to focus on"
}`;
}

export default function SupabaseCSQuestion({
  topicKey,
  topicLabel,
}) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const [localIdx, setLocalIdx] = useState(() => {
    // Clear stale keys from previous versions
    ["v2", "v3", "local_q_idx_v2_cs_", "local_q_idx_v3_cs_"].forEach(v => {
      const key = `supabase_q_idx_${v}_cs_${topicKey}`;
      if (sessionStorage.getItem(key)) sessionStorage.removeItem(key);
    });
    const stored = sessionStorage.getItem(PROGRESS_KEY(topicKey));
    return stored ? parseInt(stored, 10) : 0;
  });

  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

  // Fetch from Supabase on mount
  useEffect(() => {
    setLoading(true);
    supabaseClient
      .from("questions")
      .select(`
        id,
        topic,
        topic_key,
        subject,
        paper_ref,
        label,
        question_text,
        total_marks,
        difficulty,
        mark_scheme_text
      `)
      .eq("subject", "cs")
      .order("id", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data?.length) {
          console.warn("[SupabaseCSQuestion] Supabase fetch failed or empty, using fallback:", error?.message);
          setQuestions(PRELOADED_PAIRS.map(p => ({
            id: `local_${p.id}`,
            question_text: p.question,
            mark_scheme_text: p.markscheme,
            total_marks: extractMarksFromText(p.markscheme) ?? 2,
            paper_ref: "9618",
            topic: topicLabel ?? topicKey,
            diagram_svg: p.diagram_svg ?? null,
            _raw: p,
          })));
          setUsingFallback(true);
        } else {
          // Merge diagram_svg from PRELOADED_PAIRS by matching question index
          const merged = data.map((row, i) => ({
            ...row,
            diagram_svg: PRELOADED_PAIRS[i]?.diagram_svg ?? null,
          }));
          setQuestions(merged);
          setUsingFallback(false);
        }
        setLoading(false);
      });
  }, [topicKey]);

  const total = questions.length;
  const clampedIdx = Math.max(0, Math.min(localIdx, Math.max(total - 1, 0)));
  const question = questions[clampedIdx] ?? null;

  function goToQuestion(newIdx) {
    const clamped = Math.max(0, Math.min(newIdx, total - 1));
    sessionStorage.setItem(PROGRESS_KEY(topicKey), String(clamped));
    setLocalIdx(clamped);
    setAnswer("");
    setFeedback(null);
    setSubmitError(null);
    setShowCalc(false);
  }

  async function handleSubmit() {
    if (!answer.trim() || submitting || !question) return;
    setSubmitting(true);
    setSubmitError(null);

    const questionText = question.question_text ?? "";
    const markScheme = question.mark_scheme_text ?? "";
    const totalMarks = question.total_marks ?? extractMarksFromText(markScheme) ?? 2;
    const prompt = buildPrompt(questionText, markScheme, totalMarks, answer);

    const schema = {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
      required: ["marks_earned", "cambridge_insight", "next_step"],
    };

    let fb = null;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: schema,
      });
      fb = result?.response ?? result;
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    if (!fb) {
      setSubmitError("No response received. Please try again.");
      setSubmitting(false);
      return;
    }

    const marksEarned = fb.marks_earned ?? 0;

    await csRecordAttempt(topicKey, marksEarned, {
      total_marks: totalMarks,
      question_id: String(question.id),
    });

    if (marksEarned < totalMarks) {
      csWriteMistakeDna(fb, String(question.id), question.topic ?? topicLabel ?? topicKey, marksEarned, totalMarks, answer).catch(() => {});
      await csAddToReviewBank({
        question_id: String(question.id),
        topic: question.topic ?? topicLabel ?? topicKey,
        question_text: questionText,
        mark_scheme: markScheme,
        total_marks: totalMarks,
        first_attempt_score: marksEarned,
        first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: answer,
      });
    }

    setFeedback({ fb, marksEarned, totalMarks });
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading questions…</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const questionText = question.question_text ?? "";
  const markScheme = question.mark_scheme_text ?? "";
  const totalMarks = question.total_marks ?? extractMarksFromText(markScheme) ?? 2;
  const diagramSvg = question.diagram_svg ?? null;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-wide text-foreground">CAIE Computer Science</span>
            {usingFallback && (
              <span className="text-[9px] text-amber-400/60 font-mono">offline mode</span>
            )}
          </div>
          <button
            onClick={() => setShowCalc(c => !c)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
              showCalc
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:brightness-110"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calc
          </button>
        </div>

        {/* Question navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-card/50">
          <button
            onClick={() => goToQuestion(clampedIdx - 1)}
            disabled={clampedIdx === 0}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-xs font-bold text-foreground font-mono">
            Q{clampedIdx + 1} <span className="text-muted-foreground font-normal">of {total}</span>
          </span>

          <button
            onClick={() => goToQuestion(clampedIdx + 1)}
            disabled={clampedIdx >= total - 1}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* Calculator */}
          {showCalc && (
            <ScientificCalculator onClose={() => setShowCalc(false)} />
          )}

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label ?? `Question ${clampedIdx + 1}`}
              </span>
              {(question.topic ?? topicLabel) && (
                <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {question.topic ?? topicLabel}
                </span>
              )}
            </div>

            {/* Diagram / table if present */}
            {diagramSvg && (
              <div
                className="rounded-xl p-3 border border-border/40 overflow-x-auto bg-white"
                dangerouslySetInnerHTML={{ __html: diagramSvg }}
              />
            )}

            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {questionText}
            </p>

            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{totalMarks} marks]</span>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`rounded-xl border p-4 space-y-3 ${
              feedback.marksEarned >= feedback.totalMarks
                ? "bg-green-500/8 border-green-500/25"
                : "bg-red-500/8 border-red-500/20"
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Feedback</p>
                <span className={`font-mono text-sm font-bold ${
                  feedback.marksEarned >= feedback.totalMarks ? "text-green-400" : "text-red-400"
                }`}>
                  {feedback.marksEarned}/{feedback.totalMarks}
                </span>
              </div>

              {/* Show all mark_N fields dynamically */}
              {Object.entries(feedback.fb)
                .filter(([k]) => /^mark_\d+$/.test(k))
                .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
                .map(([key, m]) => m && (
                  <div key={key} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                    m.earned ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                  }`}>
                    <span className="font-bold shrink-0">{m.earned ? "✓" : "✗"}</span>
                    <span>{m.keyword} — {m.feedback}</span>
                  </div>
                ))
              }

              {/* Mark scheme reveal */}
              {markScheme && (
                <div className="bg-secondary/60 rounded-lg px-3 py-2.5 space-y-1 border-t border-white/5 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mark Scheme</p>
                  <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{markScheme}</p>
                </div>
              )}

              {feedback.fb.cambridge_insight && (
                <div className="bg-primary/8 border border-primary/20 rounded-lg px-3 py-2.5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cambridge Insight</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{feedback.fb.cambridge_insight}</p>
                </div>
              )}

              {feedback.fb.next_step && (
                <p className="text-[11px] text-muted-foreground/70 italic px-1">{feedback.fb.next_step}</p>
              )}
            </div>
          )}

          <AnswerInput value={answer} onChange={setAnswer} />

          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Marking…" : feedback ? "Re-submit" : "Submit Answer"}
          </button>

          {submitError && <p className="text-center text-sm text-red-400/80">{submitError}</p>}

        </div>
      </div>

      {submitting && <SubmittingOverlay />}
    </div>
  );
}