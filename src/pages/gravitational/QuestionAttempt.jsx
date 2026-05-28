import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "../../components/AnswerInput";
import { getNextGravitationalQuestion, advanceGravitationalIndex, GRAVITATIONAL_QUESTIONS } from "@/lib/gravitationalBank";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "@/lib/topicStore";
import DevQuestionJumper from "@/components/DevQuestionJumper";
import TeachMeHow from "@/components/TeachMeHow";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { useNodeAwareSubmit } from "@/hooks/useNodeAwareSubmit";

export default function GravitationalQuestionAttempt() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [overrideQuestion, setOverrideQuestion] = useState(null);
  const [showTeachMe, setShowTeachMe] = useState(false);
  const { submit, loading, timedOut, error, setError } = useNodeAwareSubmit();

  const queued = getNextGravitationalQuestion();
  const question = overrideQuestion ?? queued.question;
  const idx = overrideQuestion ? 0 : queued.idx;
  const total = overrideQuestion ? 1 : queued.total;
  const isEmpty = answer.trim().length === 0;

  const handleSubmit = async () => {
    const fb = await submit(question, answer);
    if (!fb) return;

    const marksEarned = fb.marks_earned ?? 0;
    const fullMarks = marksEarned >= question.total_marks;

    await recordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });
    if (!fullMarks) {
      writeMistakeDna(fb, question.id, question.topic, marksEarned, question.total_marks, answer).catch(() => {});
      await addToReviewBank({
        question_id: question.id, topic: question.topic, question_text: question.text,
        mark_scheme: question.mark_scheme ?? "", total_marks: question.total_marks,
        first_attempt_score: marksEarned, first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: answer,
      });
    }

    advanceGravitationalIndex();
    navigate("/feedback", {
      state: {
        feedback: fb, answer, topicKey: question.topic_key, questionId: question.id,
        nextFullRoute: "/gravitational/question", nextRetryRoute: "/gravitational/question",
        backRoute: "/physics", paperRef: question.paper_ref,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{question.paper_ref}</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">{question.label}</span>
              <span className="font-mono text-[11px] text-muted-foreground">Q{idx + 1} of {total}</span>
            </div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">{question.topic}</span>
            <p className="text-[15px] leading-relaxed text-foreground/90">{question.text}</p>
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{question.total_marks} mark{question.total_marks !== 1 ? "s" : ""}]</span>
            </div>
          </div>

          {showTeachMe ? (
            <TeachMeHow question={question} onFinalSubmit={async (fb, finalAnswer) => {
              const m = fb.marks_earned ?? 0;
              await recordAttempt(question.topic_key, m, { total_marks: question.total_marks, question_id: question.id });
              writeMistakeDna(fb, question.id, question.topic, m, question.total_marks, finalAnswer).catch(() => {});
              await addToReviewBank({ question_id: question.id, topic: question.topic, question_text: question.text, mark_scheme: question.mark_scheme ?? "", total_marks: question.total_marks, first_attempt_score: m, first_attempt_feedback: fb.cambridge_insight ?? "", first_attempt_answer: finalAnswer });
              advanceGravitationalIndex();
              navigate("/feedback", { state: { feedback: fb, answer: finalAnswer, topicKey: question.topic_key, questionId: question.id, nextFullRoute: "/gravitational/question", nextRetryRoute: "/gravitational/question", backRoute: "/physics", paperRef: question.paper_ref } });
            }} onClose={() => setShowTeachMe(false)} />
          ) : (
            <>
              <AnswerInput value={answer} onChange={setAnswer} />
              <div className="flex gap-2">
                <button onClick={() => setShowTeachMe(true)} disabled={!isEmpty} className="flex-1 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed">Teach Me How</button>
                <button onClick={handleSubmit} disabled={isEmpty || loading} className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">{loading ? "Marking…" : "Submit"}</button>
              </div>
              {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
            </>
          )}
          <DevQuestionJumper allQuestions={GRAVITATIONAL_QUESTIONS} onJump={(q) => { setOverrideQuestion(q); setAnswer(""); setShowTeachMe(false); setError(null); }} />
        </div>
      </div>
      {loading && <SubmittingOverlay timedOut={timedOut} />}
    </div>
  );
}