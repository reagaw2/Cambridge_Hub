import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Flame } from "lucide-react";
import AnswerInput from "../components/AnswerInput";
import SubmitButton from "../components/SubmitButton";
import { getReviewBank, recordAttempt, removeFromReviewBank, incrementReviewBankClears } from "../lib/topicStore";

export default function ReviewSession() {
  const navigate = useNavigate();
  const [bank, setBank] = useState(() => getReviewBank());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const current = bank[currentIndex];

  if (!current) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">
        <p className="text-lg font-semibold text-foreground max-w-sm leading-relaxed">
          No questions in your review bank right now.
        </p>
        <button onClick={() => navigate("/")} className="mt-8 text-sm text-primary hover:brightness-110">
          Back to dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student is reviewing a question they previously got wrong.

Question: "${current.question_text}"
Mark scheme: ${current.mark_scheme}
Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of ${current.total_marks}],
  "mark_1": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone",
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
          next_step: { type: "string" }
        }
      }
    }).catch(() => null);

    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }

    const result = feedback.response ?? feedback;
    const newScore = result.marks_earned ?? 0;
    const isImprovement = newScore > current.first_attempt_score;
    const isFullMarks = newScore >= current.total_marks;

    // Always record attempt to streak
    recordAttempt("gravitational_fields", newScore);

    if (isImprovement && isFullMarks) {
      removeFromReviewBank(current.question_id);
      incrementReviewBankClears();
      const remainingBank = getReviewBank();
      navigate("/review-affirmation", {
        state: {
          bankEmpty: remainingBank.length === 0,
          nextIndex: currentIndex,
          updatedBank: remainingBank
        }
      });
    } else {
      // keep in bank, show standard feedback with try-again
      navigate("/feedback", {
        state: {
          feedback: result,
          answer,
          isReview: true,
          reviewQuestionId: current.question_id,
          reviewBank: bank,
          reviewIndex: currentIndex
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
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
              {current.first_attempt_feedback ? ` · ${current.first_attempt_feedback}` : ""}
            </p>
          </div>

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
            <p className="text-[15px] leading-relaxed text-foreground/90">{current.question_text}</p>
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{current.total_marks} mark{current.total_marks !== 1 ? "s" : ""}]</span>
            </div>
          </div>

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