import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "../../components/AnswerInput";
import SubmitButton from "../../components/SubmitButton";

const QUESTION = {
  label: "Question 4(b)(iv)",
  topic: "Oscillations",
  text: "Describe the interchange between kinetic energy and potential energy during the oscillations. Numerical values are not required.",
  marks: "[3 marks]",
};
const PAPER_REF = "9702/44 · Oct/Nov 2025";
const TOPIC_KEY = "oscillations";
const QUESTION_ID = "w25_44_Q4biv";

export default function OscillationsSimilarQuestion() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe the interchange between kinetic energy and potential energy during the oscillations. Numerical values are not required.
Mark scheme:
- B1 mark 1: kinetic energy is maximum at zero displacement, or kinetic energy is zero at maximum displacement
- B1 mark 2: potential energy is zero at zero displacement, or potential energy is maximum at maximum displacement
- B1 mark 3: kinetic energy plus potential energy is constant at all times
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 3],
  "mark_1": { "earned": true or false, "keyword": "kinetic energy maximum at zero displacement", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "potential energy zero at zero displacement", "found": true or false, "feedback": "one sentence explanation" },
  "mark_3": { "earned": true or false, "keyword": "kinetic energy plus potential energy is constant", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone",
  "next_step": "one sentence telling the student exactly what to focus on in their next attempt"
}`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          marks_earned: { type: "number" },
          mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          cambridge_insight: { type: "string" },
          next_step: { type: "string" }
        }
      }
    }).catch(() => null);
    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }
    navigate("/feedback", {
      state: {
        feedback: feedback.response ?? feedback,
        answer,
        topicKey: TOPIC_KEY,
        questionId: QUESTION_ID,
        nextFullRoute: "/",
        nextRetryRoute: "/oscillations/similar-question",
        backRoute: "/oscillations/question",
        paperRef: PAPER_REF,
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/oscillations/question")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{PAPER_REF}</span>
        </div>
        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">{QUESTION.label}</span>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">{QUESTION.topic}</span>
            <p className="text-[15px] leading-relaxed text-foreground/90">{QUESTION.text}</p>
            <div className="flex justify-end"><span className="font-mono text-xs text-muted-foreground">{QUESTION.marks}</span></div>
          </div>
          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0 || loading} loading={loading} onClick={handleSubmit} />
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
        </div>
      </div>
    </div>
  );
}