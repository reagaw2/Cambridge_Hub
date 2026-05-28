import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "../../components/AnswerInput";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "@/lib/topicStore";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { useNodeAwareSubmit } from "@/hooks/useNodeAwareSubmit";

const QUESTION = {
  id: "9702-22-ON17-Q4a",
  label: "Question 4(a)",
  paper_ref: "9702/22 · Oct/Nov 2017",
  topic: "Waves",
  topic_key: "waves",
  text: "State the conditions required for the formation of a stationary wave.",
  total_marks: 2,
  mark_scheme: "B1: two waves travelling at the same speed in opposite directions overlap. B1: the waves are the same type and have the same frequency or wavelength.",
  prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the conditions required for the formation of a stationary wave.
Mark scheme:
- B1 mark 1: two waves travelling at the same speed in opposite directions overlap
- B1 mark 2: the waves are the same type and have the same frequency or wavelength
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "two waves travelling in opposite directions overlap", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "same frequency / same wavelength", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  response_schema: {
    type: "object",
    properties: {
      marks_earned: { type: "number" },
      mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
      mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
      cambridge_insight: { type: "string" },
      next_step: { type: "string" },
    },
  },
};

export default function WavesQuestionAttempt() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const { submit, loading, error } = useNodeAwareSubmit();
  const isEmpty = answer.trim().length === 0;

  const handleSubmit = async () => {
    const fb = await submit(QUESTION, answer);
    if (!fb) return;
    const marksEarned = fb.marks_earned ?? 0;
    await recordAttempt(QUESTION.topic_key, marksEarned, { total_marks: QUESTION.total_marks, question_id: QUESTION.id });
    if (marksEarned < QUESTION.total_marks) {
      writeMistakeDna(fb, QUESTION.id, QUESTION.topic, marksEarned, QUESTION.total_marks, answer).catch(() => {});
      await addToReviewBank({ question_id: QUESTION.id, topic: QUESTION.topic, question_text: QUESTION.text, mark_scheme: QUESTION.mark_scheme, total_marks: QUESTION.total_marks, first_attempt_score: marksEarned, first_attempt_feedback: fb.cambridge_insight ?? "", first_attempt_answer: answer });
    }
    navigate("/feedback", { state: { feedback: fb, answer, topicKey: QUESTION.topic_key, questionId: QUESTION.id, nextFullRoute: "/waves/question", nextRetryRoute: "/waves/question", backRoute: "/physics", paperRef: QUESTION.paper_ref } });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{QUESTION.paper_ref}</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">{QUESTION.label}</span>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">{QUESTION.topic}</span>
            <p className="text-[15px] leading-relaxed text-foreground/90">{QUESTION.text}</p>
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{QUESTION.total_marks} marks]</span>
            </div>
          </div>

          <AnswerInput value={answer} onChange={setAnswer} />
          <button onClick={handleSubmit} disabled={isEmpty || loading} className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Marking…" : "Submit Answer"}
          </button>
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
        </div>
      </div>

      {loading && <SubmittingOverlay />}
    </div>
  );
}