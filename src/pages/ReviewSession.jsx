import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Flame, AlertTriangle } from "lucide-react";
import AnswerInput from "../components/AnswerInput";
import QuestionMedia from "../components/QuestionMedia";
import QuestionNoteWidget from "../components/QuestionNoteWidget";
import SubmitButton from "../components/SubmitButton";
import { getReviewBank, recordAttempt, updateReviewBankEntry, incrementReviewBankClears, resetReviewBankLock, isSimilarAnswer } from "../lib/topicStore";

export default function ReviewSession() {
  const navigate = useNavigate();
  const [bank, setBank] = useState([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReviewBank().then((rb) => { setBank(rb); setBankLoading(false); });
  }, []);

  const current = bank[currentIndex];

  if (bankLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">
        <p className="text-lg font-semibold text-foreground max-w-sm leading-relaxed">
          No questions in your review bank right now.
        </p>
        <button onClick={() => navigate("/physics")} className="mt-8 text-sm text-primary hover:brightness-110">
          Back to dashboard
        </button>
      </div>
    );
  }

  const isPersistentAttempt = isSimilarAnswer(
    answer,
    current.last_wrong_answer ?? current.first_attempt_answer ?? ""
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const persistenceContext = (isPersistentAttempt && answer.trim().length > 10)
      ? `\n\nIMPORTANT: The student has given essentially the same wrong answer as before. This is a PERSISTENT MISUNDERSTANDING. In cambridge_insight, specifically name the exact misconception they keep repeating and explain why it is wrong. Be direct.`
      : "";

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student is reviewing a question they previously got wrong.${persistenceContext}

Question: "${current.question_text}"
Mark scheme: ${current.mark_scheme}
Total marks: ${current.total_marks}
Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of ${current.total_marks}],
  "mark_1": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for${persistenceContext ? " — address the persistent misunderstanding directly" : ""}",
  "pulse_layer_1": "reusable rule for this question type in ≤15 words",
  "next_step": "one sentence telling the student exactly what to focus on"
}`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          marks_earned: { type: "number" },
          mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          cambridge_insight: { type: "string" },
          pulse_layer_1: { type: "string" },
          next_step: { type: "string" },
        },
      },
    }).catch(() => null);

    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }

    const result = feedback.response ?? feedback;
    const newScore = result.marks_earned ?? 0;
    const isFullMarks = newScore >= current.total_marks;

    // Always record attempt for streak
    await recordAttempt(current.topic, newScore, { total_marks: current.total_marks, question_id: current.question_id });

    // Signal review gate
    sessionStorage.setItem("review_gate_attempt", "1");

    // Update bank — persistent misunderstanding detection happens here
    const { removed, isPersistent } = await updateReviewBankEntry(current.question_id, answer, isFullMarks);

    if (isFullMarks) {
      await incrementReviewBankClears();
      const remainingBank = await getReviewBank();
      navigate("/review-affirmation", {
        state: {
          bankEmpty: remainingBank.length === 0,
          nextIndex: currentIndex,
          updatedBank: remainingBank,
        },
      });
    } else {
      navigate("/feedback", {
        state: {
          feedback: result,
          answer,
          isReview: true,
          isPersistentMisunderstanding: isPersistent,
          reviewQuestionId: current.question_id,
          reviewBank: bank,
          reviewIndex: currentIndex,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Review Session</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {currentIndex + 1} / {bank.length}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* Context banner */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">Previous attempt</p>
            <p className="text-xs text-foreground/60 leading-relaxed">
              <span className="text-amber-400/80 font-medium">{current.first_attempt_score}/{current.total_marks} marks</span>
              {" · "}
              {current.persistent_misunderstanding
                ? "⚠ Persistent misunderstanding detected on last review — focus on what's different this time."
                : current.first_attempt_score === 0
                  ? "You did not get this last time. Trust what you have learned since then."
                  : "You were close last time. One more piece and this is yours."}
            </p>
          </div>

          {/* Persistent misunderstanding warning before submit */}
          {isPersistentAttempt && answer.trim().length > 10 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300/90 leading-relaxed">
                Your answer looks very similar to what you wrote before. Make sure you're not repeating the same mistake — review the mark scheme keywords before submitting.
              </p>
            </div>
          )}

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                Review Question
              </span>
            </div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {current.topic}
            </span>
            <QuestionMedia question={current} />
            <p className="text-[15px] leading-relaxed text-foreground/90">{current.question_text}</p>
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{current.total_marks} mark{current.total_marks !== 1 ? "s" : ""}]</span>
            </div>
          </div>

          {/* Notes */}
          <QuestionNoteWidget
            questionId={current.question_id}
            topic={current.topic}
            questionText={current.question_text}
          />

          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0 || loading} loading={loading} onClick={handleSubmit} />
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}

          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="font-mono text-[11px] text-muted-foreground/50">Review counts toward your streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}