import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "../../components/AnswerInput";
import SubmitButton from "../../components/SubmitButton";

const QUESTION = {
  label: "Question 6(a)(ii)",
  topic: "Capacitance",
  text: "State the name of the type of rectification produced by a bridge rectifier circuit.",
  marks: "[1 mark]",
};
const PAPER_REF = "9702/44 · Oct/Nov 2025";
const TOPIC_KEY = "capacitance";
const QUESTION_ID = "w25_44_Q6aii";

export default function CapacitanceSimilarQuestion() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the name of the type of rectification produced by a bridge rectifier circuit.
Mark scheme:
- B1 mark 1: full-wave rectification
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 1],
  "mark_1": { "earned": true or false, "keyword": "full-wave rectification", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone",
  "next_step": "one sentence telling the student exactly what to focus on in their next attempt"
}`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          marks_earned: { type: "number" },
          mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
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
        nextRetryRoute: "/capacitance/similar-question",
        backRoute: "/capacitance/question",
        paperRef: PAPER_REF,
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/capacitance/question")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
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