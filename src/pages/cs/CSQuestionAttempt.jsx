/**
 * Shared CS question attempt UI.
 * Used by all CS topic question pages.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import SubmitButton from "@/components/SubmitButton";
import { csRecordAttempt, csAddToReviewBank } from "@/lib/csTopicStore";

const CS_QUESTION_META = {};

export default function CSQuestionAttempt({ question, idx, total, onAdvance }) {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: question.prompt(answer),
      model: "claude_sonnet_4_6",
      response_json_schema: question.response_schema,
    }).catch(() => null);

    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }

    const fb = feedback.response ?? feedback;
    const marksEarned = fb.marks_earned ?? 0;
    const fullMarks = marksEarned >= question.total_marks;

    await csRecordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });

    if (!fullMarks) {
      await csAddToReviewBank({
        question_id: question.id,
        topic: question.topic,
        question_text: question.text,
        mark_scheme: "",
        total_marks: question.total_marks,
        first_attempt_score: marksEarned,
        first_attempt_feedback: fb.cambridge_insight ?? "",
      });
    }

    onAdvance();

    navigate("/cs/feedback", {
      state: {
        feedback: fb,
        answer,
        topicKey: question.topic_key,
        questionId: question.id,
        totalMarks: question.total_marks,
        backRoute: `/cs/${question.topic_key.replace(/_/g, "-")}/question`,
        dashRoute: "/cs",
        paperRef: question.paper_ref,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Computer Science</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {question.paper_ref}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">Q{idx + 1} of {total}</span>
            </div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {question.topic}
            </span>
            <p className="text-[15px] leading-relaxed text-foreground/90">{question.text}</p>
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">
                [{question.total_marks} mark{question.total_marks !== 1 ? "s" : ""}]
              </span>
            </div>
          </div>

          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0 || loading} loading={loading} onClick={handleSubmit} />
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
        </div>
      </div>
    </div>
  );
}