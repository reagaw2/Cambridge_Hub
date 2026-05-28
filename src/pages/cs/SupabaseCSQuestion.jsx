import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { csRecordAttempt, csAddToReviewBank, csWriteMistakeDna } from "@/lib/csTopicStore";
import { base44 } from "@/api/base44Client";
import { useSupabaseQuestions, buildSupabasePrompt, buildSupabaseSchema } from "@/hooks/useSupabaseQuestions";
import CSQuestionAttempt from "./CSQuestionAttempt";

/**
 * SupabaseCSQuestion
 *
 * Generic CS question page backed by Supabase.
 * Pass topicKey, topicLabel, route, and a fallback { questions, getNext, advance }.
 */
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
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fallbackOverride, setFallbackOverride] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-3">
        <div className="w-6 h-6 border-4 border-border border-t-blue-400 rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading questions…</p>
      </div>
    );
  }

  // No Supabase questions — use hardcoded fallback bank
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

  async function handleSubmit() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const prompt = buildSupabasePrompt(question, answer);
    const schema = buildSupabaseSchema(question);

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
    const resolvedTopicKey = question.topic_key ?? topicKey;

    await csRecordAttempt(resolvedTopicKey, marksEarned, {
      total_marks: question.total_marks,
      question_id: question.id,
    });

    if (marksEarned < question.total_marks) {
      csWriteMistakeDna(fb, question.id, question.topic, marksEarned, question.total_marks, answer).catch(() => {});
      await csAddToReviewBank({
        question_id: question.id,
        topic: question.topic,
        question_text: question.question_text,
        mark_scheme: question.mark_scheme_text ?? "",
        total_marks: question.total_marks,
        first_attempt_score: marksEarned,
        first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: answer,
      });
    }

    advance();

    navigate("/cs/feedback", {
      state: {
        feedback: fb,
        answer,
        topicKey: resolvedTopicKey,
        questionId: question.id,
        totalMarks: question.total_marks,
        topicRoute: route,
        backRoute: route,
        dashRoute: "/cs",
        paperRef: question.paper_ref,
        topicLabel,
        isLastQuestion: false,
      },
    });

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

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
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {question.paper_ref ?? "9618"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label ?? `Question ${idx + 1}`}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">Q{idx + 1} of {total}</span>
            </div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {question.topic}
            </span>
            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{question.question_text}</p>
            <div className="flex items-center justify-between">
              {question.difficulty && (
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  question.difficulty === "easy"
                    ? "text-green-400 bg-green-500/10 border-green-500/20"
                    : question.difficulty === "hard"
                      ? "text-red-400 bg-red-500/10 border-red-500/20"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}>
                  {question.difficulty}
                </span>
              )}
              <span className="font-mono text-xs text-muted-foreground ml-auto">
                [{question.total_marks} mark{question.total_marks !== 1 ? "s" : ""}]
              </span>
            </div>
          </div>

          <AnswerInput value={answer} onChange={setAnswer} />

          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Marking…" : "Submit Answer"}
          </button>

          {submitError && <p className="text-center text-sm text-red-400/80">{submitError}</p>}

        </div>
      </div>

      {submitting && <SubmittingOverlay />}
    </div>
  );
}