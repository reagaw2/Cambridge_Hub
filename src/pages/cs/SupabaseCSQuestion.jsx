import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, ChevronRight, SkipForward } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import QuestionDiagram from "@/components/QuestionDiagram";
import { csRecordAttempt, csAddToReviewBank, csWriteMistakeDna } from "@/lib/csTopicStore";
import { base44 } from "@/api/base44Client";
import { useSupabaseQuestions, buildSupabasePrompt, buildSupabaseSchema } from "@/hooks/useSupabaseQuestions";
import CSQuestionAttempt from "./CSQuestionAttempt";

function splitIntoParts(questionText, markSchemeText) {
  const subPartRegex = /\n?\s*\(([a-z]+|i{1,3}v?|vi{0,3}|ix|x)\)\s*/g;
  const matches = [...questionText.matchAll(subPartRegex)];

  if (matches.length === 0) {
    return [{ label: null, text: questionText.trim(), markScheme: markSchemeText ?? "" }];
  }

  const parts = [];
  let introText = questionText.slice(0, matches[0].index).trim();

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const label = `(${match[1]})`;
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : questionText.length;
    const text = questionText.slice(start, end).trim();

    const msPattern = new RegExp(`\\(${match[1]}\\)[^\\n]*\\n?([^\\(]*)`, "i");
    const msMatch = (markSchemeText ?? "").match(msPattern);
    const markScheme = msMatch ? msMatch[0].trim() : "";

    parts.push({
      label,
      text: introText ? `${introText}\n\n${label} ${text}` : `${label} ${text}`,
      markScheme,
      rawText: text,
    });
    introText = "";
  }

  return parts;
}

function buildPartPrompt(question, part, answer) {
  const markSchemeBlock = part.markScheme || question.mark_scheme_text || "See mark scheme.";
  const totalMarks = extractMarksFromText(markSchemeBlock) || question.total_marks || 1;

  return `You are a Cambridge A Level Computer Science examiner. A student has answered the following question sub-part:

Question: "${part.text}"
Paper: ${question.paper_ref ?? "9618"}
Marks available: ${totalMarks}

Mark scheme:
${markSchemeBlock}

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond ONLY in this JSON format:
{
  "marks_earned": [number 0 to ${totalMarks}],
  "mark_1": { "earned": true or false, "keyword": "key phrase needed", "found": true or false, "feedback": "one sentence" },
  "mark_2": { "earned": true or false, "keyword": "second key phrase if applicable", "found": true or false, "feedback": "one sentence" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why",
  "next_step": "one sentence telling the student exactly what to focus on"
}`;
}

function extractMarksFromText(text) {
  const m = text.match(/\[(\d+)\]/) ?? text.match(/\((\d+)\s*marks?\)/i);
  return m ? parseInt(m[1], 10) : null;
}

export default function SupabaseCSQuestion({
  topicKey,
  topicLabel,
  route,
  fallbackQuestions,
  fallbackGetNext,
  fallbackAdvance,
}) {
  const navigate = useNavigate();
  const { questions, loading, getCurrentQuestion, advance, getProgress } = useSupabaseQuestions(topicKey, "cs");
  const [answers, setAnswers] = useState({});
  const [partIndex, setPartIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [partFeedbacks, setPartFeedbacks] = useState([]);
  const [fallbackOverride, setFallbackOverride] = useState(null);
  const [showSkipPanel, setShowSkipPanel] = useState(false);
  const [skipInput, setSkipInput] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-3">
        <div className="w-6 h-6 border-4 border-border border-t-blue-400 rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading questions…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    const queued = fallbackGetNext();
    const question = fallbackOverride ?? queued.question;
    const idx = fallbackOverride ? 0 : queued.idx;
    const total = fallbackOverride ? 1 : queued.total;
    return (
      <CSQuestionAttempt
        question={question} idx={idx} total={total}
        onAdvance={() => { setFallbackOverride(null); fallbackAdvance(); }}
        allQuestions={fallbackQuestions}
        onOverride={(q) => setFallbackOverride(q)}
      />
    );
  }

  const question = getCurrentQuestion();
  const { idx, total } = getProgress();

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const parts = splitIntoParts(question.question_text, question.mark_scheme_text);
  const currentPart = parts[partIndex];
  const currentAnswer = answers[partIndex] ?? "";
  const totalParts = parts.length;
  const isLastPart = partIndex === totalParts - 1;
  const showDiagram = partIndex === 0 && question.diagram_svg;

  function resetForNewQuestion() {
    setAnswers({});
    setPartIndex(0);
    setPartFeedbacks([]);
    setSubmitError(null);
  }

  function handleSkipToQuestion(targetIdx) {
    const clampedIdx = Math.max(0, Math.min(targetIdx, questions.length - 1));
    // Write the target index to sessionStorage so useSupabaseQuestions picks it up
    const progressKey = `supabase_q_idx_cs_${topicKey}`;
    sessionStorage.setItem(progressKey, String(clampedIdx));
    resetForNewQuestion();
    setShowSkipPanel(false);
    setSkipInput("");
    // Force re-render by triggering a state update
    window.location.reload();
  }

  async function handleSubmitPart() {
    if (!currentAnswer.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const prompt = buildPartPrompt(question, currentPart, currentAnswer);
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
    const partMarks = extractMarksFromText(currentPart.markScheme) || 1;
    const resolvedTopicKey = question.topic_key ?? topicKey;

    await csRecordAttempt(resolvedTopicKey, marksEarned, {
      total_marks: partMarks,
      question_id: `${question.id}_${currentPart.label ?? "q"}`,
    });

    if (marksEarned < partMarks) {
      csWriteMistakeDna(fb, question.id, question.topic, marksEarned, partMarks, currentAnswer).catch(() => {});
      await csAddToReviewBank({
        question_id: `${question.id}_${currentPart.label ?? "q"}`,
        topic: question.topic,
        question_text: currentPart.text,
        mark_scheme: currentPart.markScheme,
        total_marks: partMarks,
        first_attempt_score: marksEarned,
        first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: currentAnswer,
      });
    }

    const newFeedbacks = [...partFeedbacks, { part: currentPart, answer: currentAnswer, fb, marksEarned, partMarks }];
    setPartFeedbacks(newFeedbacks);

    if (isLastPart) {
      const totalEarned = newFeedbacks.reduce((s, f) => s + f.marksEarned, 0);
      const totalAvailable = newFeedbacks.reduce((s, f) => s + f.partMarks, 0);

      advance();

      navigate("/cs/feedback", {
        state: {
          feedback: {
            marks_earned: totalEarned,
            cambridge_insight: newFeedbacks.map(f => f.fb.cambridge_insight).filter(Boolean).join(" "),
            next_step: newFeedbacks[newFeedbacks.length - 1]?.fb.next_step ?? "",
            part_feedbacks: newFeedbacks.map(f => ({
              label: f.part.label,
              question: f.part.rawText ?? f.part.text,
              answer: f.answer,
              marks_earned: f.marksEarned,
              total_marks: f.partMarks,
              mark_1: f.fb.mark_1,
              mark_2: f.fb.mark_2,
              cambridge_insight: f.fb.cambridge_insight,
              next_step: f.fb.next_step,
            })),
          },
          answer: newFeedbacks.map(f => `${f.part.label ?? ""} ${f.answer}`).join("\n\n"),
          topicKey: resolvedTopicKey,
          questionId: question.id,
          totalMarks: totalAvailable,
          topicRoute: route,
          backRoute: route,
          dashRoute: "/cs",
          paperRef: question.paper_ref,
          topicLabel,
          isLastQuestion: false,
        },
      });
    } else {
      setPartIndex(p => p + 1);
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-wide text-foreground">CAIE Computer Science</span>
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
              <Database className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <button
            onClick={() => setShowSkipPanel(p => !p)}
            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2.5 py-1 rounded-lg hover:brightness-110 transition-all"
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </button>
        </div>

        {/* Skip panel */}
        {showSkipPanel && (
          <div className="mx-4 mt-3 bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Jump to question</p>

            {/* Quick-jump grid */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSkipToQuestion(i)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all hover:brightness-110 ${
                    i === idx
                      ? "bg-primary/20 border-primary text-primary ring-1 ring-primary/40"
                      : "bg-secondary border-border text-muted-foreground"
                  }`}
                  title={q.question_text?.slice(0, 60)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Manual number input */}
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={questions.length}
                value={skipInput}
                onChange={e => setSkipInput(e.target.value)}
                placeholder={`1 – ${questions.length}`}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40"
                onKeyDown={e => { if (e.key === "Enter" && skipInput) handleSkipToQuestion(parseInt(skipInput, 10) - 1); }}
              />
              <button
                onClick={() => skipInput && handleSkipToQuestion(parseInt(skipInput, 10) - 1)}
                disabled={!skipInput}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40"
              >
                Go
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground/50">
              Currently on Q{idx + 1} · {questions.length} questions total
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono">Q{idx + 1} of {total}</span>
            {totalParts > 1 && (
              <div className="flex items-center gap-1.5">
                {parts.map((p, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${
                    i < partIndex ? "w-6 bg-green-500/60"
                    : i === partIndex ? "w-8 bg-primary"
                    : "w-4 bg-border"
                  }`} />
                ))}
                <span className="text-[11px] text-muted-foreground font-mono ml-1">
                  Part {partIndex + 1}/{totalParts}
                </span>
              </div>
            )}
          </div>

          {/* Previously answered parts */}
          {partFeedbacks.length > 0 && (
            <div className="space-y-2">
              {partFeedbacks.map((f, i) => (
                <div key={i} className={`rounded-xl border px-4 py-2.5 flex items-center justify-between ${
                  f.marksEarned >= f.partMarks
                    ? "bg-green-500/8 border-green-500/25"
                    : "bg-amber-500/8 border-amber-500/25"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${f.marksEarned >= f.partMarks ? "text-green-400" : "text-amber-400"}`}>
                      {f.part.label ?? `Part ${i + 1}`}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                      {f.answer.slice(0, 40)}{f.answer.length > 40 ? "…" : ""}
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-bold shrink-0 ${f.marksEarned >= f.partMarks ? "text-green-400" : "text-amber-400"}`}>
                    {f.marksEarned}/{f.partMarks}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label ?? `Question ${idx + 1}`}{currentPart.label ? ` ${currentPart.label}` : ""}
              </span>
              <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {question.topic}
              </span>
            </div>

            {/* Diagram — shown on first part only */}
            {showDiagram && (
              <div className="bg-white rounded-xl p-3 border border-border/40 overflow-x-auto">
                <QuestionDiagram svgString={question.diagram_svg} />
              </div>
            )}

            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {currentPart.text}
            </p>

            <div className="flex items-center justify-between">
              {question.difficulty && (
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  question.difficulty === "easy" ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : question.difficulty === "hard" ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}>
                  {question.difficulty}
                </span>
              )}
              {currentPart.markScheme && (
                <span className="font-mono text-xs text-muted-foreground ml-auto">
                  {extractMarksFromText(currentPart.markScheme) ? `[${extractMarksFromText(currentPart.markScheme)} mark${extractMarksFromText(currentPart.markScheme) !== 1 ? "s" : ""}]` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Answer box */}
          <AnswerInput
            value={currentAnswer}
            onChange={(v) => setAnswers(prev => ({ ...prev, [partIndex]: v }))}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmitPart}
            disabled={!currentAnswer.trim() || submitting}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? "Marking…" : isLastPart ? "Submit & See Results" : (
              <>Submit Part {partIndex + 1} <ChevronRight className="w-4 h-4" /></>
            )}
          </button>

          {submitError && <p className="text-center text-sm text-red-400/80">{submitError}</p>}

        </div>
      </div>

      {submitting && <SubmittingOverlay />}
    </div>
  );
}