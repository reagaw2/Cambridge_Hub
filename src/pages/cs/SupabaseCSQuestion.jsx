import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Calculator, Loader2 } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import ScientificCalculator from "@/components/ScientificCalculator";
import PulseFeedback from "@/components/PulseFeedback";
import RegisterInput from "@/components/cs/RegisterInput";
import MatchingInput from "@/components/cs/MatchingInput";
import TableFillInput from "@/components/cs/TableFillInput";
import { csRecordAttempt, csAddToReviewBank, csWriteMistakeDna } from "@/lib/csTopicStore";
import { base44, supabaseClient } from "@/api/base44Client";
import { PRELOADED_PAIRS } from "@/lib/ingestorQuestions";
import { matchDiagramToQuestion, extractDiagramConfig } from "@/lib/csQuestionDiagramMatcher";

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
  "next_step": "one sentence telling the student exactly what to focus on",
  "pulse_layer_1": "single punchy sentence of max 20 words — the exam hack or key concept that unlocks this question type",
  "pulse_layer_2_marks": [],
  "pulse_layer_3": "optional 2-4 sentence deep-dive explanation of the underlying principle"
}`;
}

/**
 * Serialise interactive state into a readable answer string for Claude.
 */
function serialiseInteractiveAnswer(diagramConfig, interactiveValue) {
  if (!diagramConfig || !interactiveValue) return null;

  if (diagramConfig.type === "matching") {
    if (!interactiveValue.length) return null;
    const lines = interactiveValue.map(m =>
      `${diagramConfig.leftItems[m.from]} → ${diagramConfig.rightItems[m.to]}`
    );
    return "Matching connections:\n" + lines.join("\n");
  }

  if (diagramConfig.type === "table_fill") {
    if (!interactiveValue?.length) return null;
    const lines = interactiveValue.flatMap((row, ri) =>
      row.map((cell, ci) => {
        const original = diagramConfig.rows[ri]?.[ci] ?? "";
        const isEmpty = original === "" || original === null || /^(&nbsp;|\s*)$/.test(String(original));
        return isEmpty && cell ? `Row ${ri + 1}, Col ${ci + 1}: ${cell}` : null;
      }).filter(Boolean)
    );
    return lines.length ? "Table answers:\n" + lines.join("\n") : null;
  }

  if (diagramConfig.type === "register") {
    const parts = (diagramConfig.registers ?? []).map((reg, i) => {
      const val = interactiveValue[i] ?? "";
      return val ? `${reg.label}: ${val}` : null;
    }).filter(Boolean);
    return parts.length ? "Register values:\n" + parts.join("\n") : null;
  }

  return null;
}

/**
 * Render the interactive component (matching / table_fill / register).
 * NOT used for static SVG references — those are rendered inline in the question card.
 */
function InteractiveDiagram({ config, value, onChange }) {
  if (!config || config.type === "svg") return null;

  if (config.type === "matching") {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Draw connections — click a left item, then a right item
        </p>
        <MatchingInput
          leftItems={config.leftItems}
          rightItems={config.rightItems}
          leftLabel={config.leftLabel}
          rightLabel={config.rightLabel}
          value={value ?? []}
          onChange={onChange}
        />
      </div>
    );
  }

  if (config.type === "table_fill") {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Complete the table — click a blank cell to type your answer
        </p>
        <TableFillInput
          headers={config.headers}
          rows={config.rows}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }

  if (config.type === "register") {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Fill in the register{config.registers?.length > 1 ? "s" : ""} — tap a cell to toggle 0 / 1
        </p>
        {(config.registers ?? []).map((reg, i) => (
          <RegisterInput
            key={i}
            label={reg.label}
            bits={reg.bits ?? 8}
            value={value?.[i] ?? ""}
            onChange={(v) => {
              const next = [...(value ?? (config.registers ?? []).map(() => ""))];
              next[i] = v;
              onChange(next);
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

export default function SupabaseCSQuestion({ topicKey, topicLabel }) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const [localIdx, setLocalIdx] = useState(() => {
    ["v2", "v3"].forEach(v => {
      sessionStorage.removeItem(`supabase_q_idx_${v}_cs_${topicKey}`);
    });
    const stored = sessionStorage.getItem(PROGRESS_KEY(topicKey));
    return stored ? parseInt(stored, 10) : 0;
  });

  const [answer, setAnswer] = useState("");
  const [interactiveValue, setInteractiveValue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabaseClient
      .from("questions")
      .select(`id, topic, topic_key, subject, paper_ref, label, question_text, total_marks, difficulty, mark_scheme_text`)
      .eq("subject", "cs")
      .order("id", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data?.length) {
          console.warn("[SupabaseCSQuestion] Supabase empty/failed, using fallback:", error?.message);
          setQuestions(PRELOADED_PAIRS.map(p => ({
            id: `local_${p.id}`,
            question_text: p.question,
            mark_scheme_text: p.markscheme,
            total_marks: extractMarksFromText(p.markscheme) ?? 2,
            paper_ref: "9618",
            topic: topicLabel ?? topicKey,
            _pair: p,
            _diagramConfig: extractDiagramConfig(p),
          })));
          setUsingFallback(true);
        } else {
          const enriched = data.map(row => {
            const matchedPair = matchDiagramToQuestion(row);
            const diagramConfig = extractDiagramConfig(matchedPair);
            return { ...row, _pair: matchedPair, _diagramConfig: diagramConfig };
          });
          setQuestions(enriched);
          setUsingFallback(false);
        }
        setLoading(false);
      });
  }, [topicKey]);

  const total = questions.length;
  const clampedIdx = Math.max(0, Math.min(localIdx, Math.max(total - 1, 0)));
  const question = questions[clampedIdx] ?? null;
  const diagramConfig = question?._diagramConfig ?? null;

  // Is this an interactive question (matching / table / register)?
  const isInteractive = diagramConfig && diagramConfig.type !== "svg";
  // Is this a static reference SVG?
  const hasReferenceSvg = diagramConfig?.type === "svg";

  function goToQuestion(newIdx) {
    const clamped = Math.max(0, Math.min(newIdx, total - 1));
    sessionStorage.setItem(PROGRESS_KEY(topicKey), String(clamped));
    setLocalIdx(clamped);
    setAnswer("");
    setInteractiveValue(null);
    setFeedback(null);
    setSubmitError(null);
    setShowCalc(false);
  }

  function handleNext() {
    if (clampedIdx < total - 1) goToQuestion(clampedIdx + 1);
    else navigate("/cs");
  }

  async function handleSubmit() {
    const questionText = question?.question_text ?? "";
    const markScheme = question?.mark_scheme_text ?? "";
    const totalMarks = question?.total_marks ?? extractMarksFromText(markScheme) ?? 2;

    const interactiveStr = serialiseInteractiveAnswer(diagramConfig, interactiveValue);
    const finalAnswer = [answer.trim(), interactiveStr].filter(Boolean).join("\n\n");

    if (!finalAnswer || submitting || !question) return;

    setSubmitting(true);
    setSubmitError(null);

    const prompt = buildPrompt(questionText, markScheme, totalMarks, finalAnswer);
    const schema = {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
        pulse_layer_1: { type: "string" },
        pulse_layer_2_marks: { type: "array", items: { type: "object" } },
        pulse_layer_3: { type: "string" },
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
      csWriteMistakeDna(fb, String(question.id), question.topic ?? topicLabel ?? topicKey, marksEarned, totalMarks, finalAnswer).catch(() => {});
      await csAddToReviewBank({
        question_id: String(question.id),
        topic: question.topic ?? topicLabel ?? topicKey,
        question_text: questionText,
        mark_scheme: markScheme,
        total_marks: totalMarks,
        first_attempt_score: marksEarned,
        first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: finalAnswer,
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
  const isLastQuestion = clampedIdx >= total - 1;

  const interactiveStr = serialiseInteractiveAnswer(diagramConfig, interactiveValue);
  // Submit is enabled if: written answer OR interactive component has input
  const hasAnswer = answer.trim().length > 0 || (interactiveStr && interactiveStr.length > 0);

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

        {/* Navigation */}
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

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}

          {/* Question card — includes static reference SVG inside if present */}
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

            {/* Static reference diagram — shown inside the question card */}
            {hasReferenceSvg && (
              <div
                className="rounded-xl p-3 border border-border/40 overflow-x-auto bg-white"
                dangerouslySetInnerHTML={{ __html: diagramConfig.svgString }}
              />
            )}

            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {questionText}
            </p>

            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{totalMarks} marks]</span>
            </div>
          </div>

          {/* Interactive component — shown separately below the question card */}
          {isInteractive && !feedback && (
            <InteractiveDiagram
              config={diagramConfig}
              value={interactiveValue}
              onChange={setInteractiveValue}
            />
          )}

          {/* Answer input + submit — only before submission */}
          {!feedback && (
            <>
              {/* For pure interactive questions without a written component, the
                  AnswerInput is still shown so students can add extra explanation */}
              <AnswerInput
                value={answer}
                onChange={setAnswer}
              />
              <button
                onClick={handleSubmit}
                disabled={!hasAnswer || submitting}
                className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
              {submitError && <p className="text-center text-sm text-red-400/80">{submitError}</p>}
            </>
          )}

          {/* Post-submission: show interactive component (read-only context) + feedback */}
          {feedback && (
            <>
              {/* Show interactive diagram again so student can see what they drew */}
              {isInteractive && (
                <div className="opacity-60 pointer-events-none">
                  <InteractiveDiagram
                    config={diagramConfig}
                    value={interactiveValue}
                    onChange={() => {}}
                  />
                </div>
              )}

              <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your answer</p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {[answer.trim(), serialiseInteractiveAnswer(diagramConfig, interactiveValue)].filter(Boolean).join("\n\n") || "(no written answer)"}
                </p>
              </div>

              <PulseFeedback
                feedback={feedback.fb}
                subject="cs"
                marksTotal={feedback.totalMarks}
                questionId={String(question.id)}
                questionText={questionText}
                studentAnswer={answer}
              />

              {markScheme && (
                <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mark Scheme</p>
                  <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{markScheme}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {isLastQuestion ? "Back to CS dashboard →" : "Next question →"}
              </button>
            </>
          )}

        </div>
      </div>

      {submitting && <SubmittingOverlay />}
    </div>
  );
}