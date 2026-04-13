import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "../components/TopBar";
import QuestionCard from "../components/QuestionCard";
import AnswerInput from "../components/AnswerInput";
import SubmitButton from "../components/SubmitButton";

const QUESTION = {
  label: "Question 1(b)(ii)",
  topic: "Gravitational Fields",
  text: "Explain why the gravitational field strength g can be considered constant close to the surface of a planet.",
  marks: "[2 marks]",
};

const MARK_SCHEME = {
  mark_1: { keyword: "changes in height ≪ radius of planet", description: "Changes in height are very much smaller than the radius of the planet — or equivalent" },
  mark_2: { keyword: "(radius + height)² ≈ radius²", description: "So (radius + height) squared is approximately equal to radius squared — meaning the distance from the centre barely changes" },
};

export default function SimilarQuestion() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: "${QUESTION.text}"
Mark scheme:
- B1 (1 mark): ${MARK_SCHEME.mark_1.description}
- B1 (1 mark): ${MARK_SCHEME.mark_2.description}
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 2],
  "mark_1": { "earned": true or false, "keyword": "${MARK_SCHEME.mark_1.keyword}", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "${MARK_SCHEME.mark_2.keyword}", "found": true or false, "feedback": "one sentence explanation" },
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
          cambridge_insight: { type: "string" },
          next_step: { type: "string" }
        }
      }
    }).catch(() => null);
    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }
    navigate("/feedback", {
      state: { feedback: feedback.response ?? feedback, answer, isSimilar: true, markScheme: MARK_SCHEME }
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 flex flex-col gap-4 p-4">
          <QuestionCard {...QUESTION} />
          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0 || loading} loading={loading} onClick={handleSubmit} />
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
        </div>
      </div>
    </div>
  );
}