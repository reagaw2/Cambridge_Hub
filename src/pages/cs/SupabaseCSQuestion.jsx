import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Database, Calculator } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import QuestionDiagram from "@/components/QuestionDiagram";
import ScientificCalculator from "@/components/ScientificCalculator";
import { csRecordAttempt, csAddToReviewBank, csWriteMistakeDna } from "@/lib/csTopicStore";
import { base44 } from "@/api/base44Client";
import { useSupabaseQuestions } from "@/hooks/useSupabaseQuestions";
import CSQuestionAttempt from "./CSQuestionAttempt";

// Bump this when the question bank changes to bust stale sessionStorage
const BANK_VERSION = "v2";
const PROGRESS_KEY_PREFIX = `supabase_q_idx_${BANK_VERSION}_cs_`;

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
  const { questions, loading } = useSupabaseQuestions(topicKey, "cs");

  const [localIdx, setLocalIdx] = useState(() => {
    // Clear any old (non-versioned) key
    const oldKey = `supabase_q_idx_cs_${topicKey}`;
    if (sessionStorage.getItem(oldKey) !== null) {
      sessionStorage.removeItem(oldKey);
    }
    const stored = sessionStorage.getItem(`${PROGRESS_KEY_PREFIX}${topicKey}`);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [answers, setAnswers] = useState({});
  const [partIndex, setPartIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [fallbackOverride, setFallbackOverride] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

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

  const clampedIdx = Math.max(0, Math.min(localIdx, questions.length - 1));
  const question = questions[clampedIdx];
  const total = questions.length;

  function goToQuestion(newIdx) {
    const clamped = Math.max(0, Math.min(newIdx, questions.length - 1));
    sessionStorage.setItem(`${PROGRESS_KEY_PREFIX}${topicKey}`, String(clamped));
    setLocalIdx(clamped);
    setPartIndex(0);
    setSubmitError(null);
    setShowCalc(false);
  }

  function goToPart(newPartIdx) {
    const parts = splitIntoParts(question.question_text, question.mark_scheme_text);
    const clamped = Math.max(0, Math.min(newPartIdx, parts.length - 1));
    setPartIndex(clamped);
    setSubmitError(null);
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const parts = splitIntoParts(question.question_text, question.mark_scheme_text);
  const currentPart = parts[partIndex];
  const totalParts = parts.length;
  const isLastPart = partIndex === totalParts - 1;
  const isFirstPart = partIndex === 0;
  const showDiagram = question.diagram_svg;

  const answerKey = `${clampedIdx}_${partIndex}`;
  const currentAnswer = answers[answerKey] ?? "";
  const currentFeedback = feedbacks[answerKey] ?? null;

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

    setFeedbacks(prev => ({ ...prev, [answerKey]: { fb, marksEarned, partMarks } }));
    setSubmitting(false);
  }

  const submittedParts = parts.map((p, i) => {
    const key = `${clampedIdx}_${i}`;
    return feedbacks[key] ? { ...feedbacks[key], part: p, answer: answers[key] ?? "" } : null;
  }).filter(Boolean);

  const allPartsSubmitted = submittedParts.length === totalParts;
  const totalEarned = submittedParts.reduce((s, f) => s + f.marksEarned, 0);
  const totalAvailable = submittedParts.reduce((s, f) => s + f.partMarks, 0);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wide text-foreground">CAIE Computer Science</span>
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
              <Database className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          {/* Calculator toggle */}
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

        {/* Part navigation */}
        {totalParts > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-card/30">
            <button
              onClick={() => goToPart(partIndex - 1)}
              disabled={isFirstPart}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Part
            </button>

            <div className="flex items-center gap-1.5">
              {parts.map((p, i) => {
                const key = `${clampedIdx}_${i}`;
                const submitted = !!feedbacks[key];
                const isActive = i === partIndex;
                return (
                  <button
                    key={i}
                    onClick={() => goToPart(i)}
                    className={`flex items-center justify-center rounded-full font-mono font-bold transition-all ${
                      isActive
                        ? "w-7 h-7 bg-primary text-primary-foreground text-[10px] scale-110"
                        : submitted
                          ? "w-6 h-6 bg-green-500/20 border border-green-500/40 text-green-400 text-[9px] hover:scale-105"
                          : "w-6 h-6 bg-secondary border border-border text-muted-foreground text-[9px] hover:scale-105"
                    }`}
                    title={p.label ?? `Part ${i + 1}`}
                  >
                    {p.label ? p.label.replace(/[()]/g, "") : i + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPart(partIndex + 1)}
              disabled={isLastPart}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
            >
              Part <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 p-4">

          {showCalc && (
            <ScientificCalculator onClose={() => setShowCalc(false)} />
          )}

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label ?? `Question ${clampedIdx + 1}`}{currentPart.label ? ` ${currentPart.label}` : ""}
              </span>
              <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {question.topic}
              </span>
            </div>

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
              {currentPart.markScheme && extractMarksFromText(currentPart.markScheme) && (
                <span className="font-mono text-xs text-muted-foreground ml-auto">
                  [{extractMarksFromText(currentPart.markScheme)} mark{extractMarksFromText(currentPart.markScheme) !== 1 ? "s" : ""}]
                </span>
              )}
            </div>
          </div>

          {/* Per-part feedback */}
          {currentFeedback && (
            <div className={`rounded-xl border p-4 space-y-3 ${
              currentFeedback.marksEarned >= currentFeedback.partMarks
                ? "bg-green-500/8 border-green-500/25"
                : "bg-red-500/8 border-red-500/20"
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Feedback</p>
                <span className={`font-mono text-sm font-bold ${
                  currentFeedback.marksEarned >= currentFeedback.partMarks ? "text-green-400" : "text-red-400"
                }`}>
                  {currentFeedback.marksEarned}/{currentFeedback.partMarks}
                </span>
              </div>
              {[currentFeedback.fb.mark_1, currentFeedback.fb.mark_2].filter(Boolean).map((m, j) => (
                <div key={j} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                  m.earned ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                }`}>
                  <span className="font-bold shrink-0">{m.earned ? "✓" : "✗"}</span>
                  <span>{m.keyword} — {m.feedback}</span>
                </div>
              ))}
              {currentFeedback.fb.cambridge_insight && (
                <p className="text-xs text-foreground/70 leading-relaxed italic border-t border-white/10 pt-2">
                  {currentFeedback.fb.cambridge_insight}
                </p>
              )}
            </div>
          )}

          <AnswerInput
            value={currentAnswer}
            onChange={(v) => setAnswers(prev => ({ ...prev, [answerKey]: v }))}
          />

          <button
            onClick={handleSubmitPart}
            disabled={!currentAnswer.trim() || submitting}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Marking…" : currentFeedback ? "Re-submit" : "Submit Answer"}
          </button>

          {submitError && <p className="text-center text-sm text-red-400/80">{submitError}</p>}

          {allPartsSubmitted && totalParts > 1 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Question Total</p>
                <span className={`font-mono text-sm font-bold ${
                  totalEarned >= totalAvailable ? "text-green-400" : "text-amber-400"
                }`}>
                  {totalEarned}/{totalAvailable}
                </span>
              </div>
              {submittedParts.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{f.part.label ?? `Part ${i + 1}`}</span>
                  <span className={`font-mono font-bold ${
                    f.marksEarned >= f.partMarks ? "text-green-400" : "text-red-400"
                  }`}>{f.marksEarned}/{f.partMarks}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {submitting && <SubmittingOverlay />}
    </div>
  );
}