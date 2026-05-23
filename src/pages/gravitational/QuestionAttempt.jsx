import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "../../components/AnswerInput";
import { getNextGravitationalQuestion, advanceGravitationalIndex, GRAVITATIONAL_QUESTIONS } from "@/lib/gravitationalBank";
import { recordAttempt, addToReviewBank } from "@/lib/topicStore";
import DevQuestionJumper from "@/components/DevQuestionJumper";
import TeachMeHow from "@/components/TeachMeHow";
import { useStreamingFeedback } from "@/hooks/useStreamingFeedback";
import StreamingFeedbackOverlay from "@/components/StreamingFeedbackOverlay";

export default function GravitationalQuestionAttempt() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [overrideQuestion, setOverrideQuestion] = useState(null);
  const [showTeachMe, setShowTeachMe] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const { streamText, isStreaming, feedback, error, startStream } = useStreamingFeedback();

  const queued = getNextGravitationalQuestion();
  const question = overrideQuestion ?? queued.question;
  const idx = overrideQuestion ? 0 : queued.idx;
  const total = overrideQuestion ? 1 : queued.total;
  const isEmpty = answer.trim().length === 0;

  const handleSubmit = async () => {
    setShowOverlay(true);
    startStream({
      prompt: question.prompt(answer),
      response_json_schema: question.response_schema,
    });
  };

  const handleFeedbackReady = useCallback(async (fb) => {
    const marksEarned = fb.marks_earned ?? 0;
    const fullMarks = marksEarned >= question.total_marks;

    await recordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });
    if (!fullMarks) {
      await addToReviewBank({
        question_id: question.id,
        topic: question.topic,
        question_text: question.text,
        mark_scheme: question.mark_scheme ?? "",
        total_marks: question.total_marks,
        first_attempt_score: marksEarned,
        first_attempt_feedback: fb.cambridge_insight ?? "",
      });
    }

    advanceGravitationalIndex();

    navigate("/feedback", {
      state: {
        feedback: fb,
        answer,
        topicKey: question.topic_key,
        questionId: question.id,
        nextFullRoute: "/gravitational/question",
        nextRetryRoute: "/gravitational/question",
        backRoute: "/physics",
        paperRef: question.paper_ref,
      },
    });
  }, [question, answer, navigate]);

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
            <TeachMeHow
              question={question}
              onFinalSubmit={async (fb, finalAnswer) => {
                const marksEarned = fb.marks_earned ?? 0;
                await recordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });
                await addToReviewBank({ question_id: question.id, topic: question.topic, question_text: question.text, mark_scheme: question.mark_scheme ?? "", total_marks: question.total_marks, first_attempt_score: marksEarned, first_attempt_feedback: fb.cambridge_insight ?? "" });
                advanceGravitationalIndex();
                navigate("/feedback", { state: { feedback: fb, answer: finalAnswer, topicKey: question.topic_key, questionId: question.id, nextFullRoute: "/gravitational/question", nextRetryRoute: "/gravitational/question", backRoute: "/physics", paperRef: question.paper_ref } });
              }}
              onClose={() => setShowTeachMe(false)}
            />
          ) : (
            <>
              <AnswerInput value={answer} onChange={setAnswer} />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTeachMe(true)}
                  disabled={!isEmpty}
                  className="flex-1 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Teach Me How
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isEmpty || isStreaming}
                  className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isStreaming ? "Marking…" : "Submit"}
                </button>
              </div>
            </>
          )}

          <DevQuestionJumper
            allQuestions={GRAVITATIONAL_QUESTIONS}
            onJump={(q) => { setOverrideQuestion(q); setAnswer(""); setShowTeachMe(false); }}
          />
        </div>
      </div>

      {showOverlay && (
        <StreamingFeedbackOverlay
          streamText={streamText}
          isStreaming={isStreaming}
          feedback={feedback}
          error={error}
          marksTotal={question.total_marks}
          onComplete={handleFeedbackReady}
        />
      )}
    </div>
  );
}