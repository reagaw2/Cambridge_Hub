import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "../components/TopBar";
import QuestionCard from "../components/QuestionCard";
import AnswerInput from "../components/AnswerInput";
import SubmitButton from "../components/SubmitButton";


export default function QuestionAttempt() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Reset question-flow tracking when starting a fresh Q1 session (not scores/streak)
  useState(() => {
    sessionStorage.setItem("full_marks_count", "0");
    sessionStorage.setItem("consecutive_full_marks", "0");
    sessionStorage.setItem("previous_score", "-1");
    console.log("[ALA Hub] Session reset — starting Q1");
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: "Describe the gravitational field in the region close to the surface of a planet."
Mark scheme:
- B1 (1 mark): Answer must include the word "radial"
- B1 (1 mark): Answer must state the field is directed "towards the centre of the planet" or equivalent
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 2],
  "mark_1": { "earned": true or false, "keyword": "radial", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "towards centre of planet", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone",
  "next_step": "one sentence telling the student exactly what to focus on in their next attempt"
}`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          marks_earned: { type: "number" },
          mark_1: {
            type: "object",
            properties: {
              earned: { type: "boolean" },
              keyword: { type: "string" },
              found: { type: "boolean" },
              feedback: { type: "string" }
            }
          },
          mark_2: {
            type: "object",
            properties: {
              earned: { type: "boolean" },
              keyword: { type: "string" },
              found: { type: "boolean" },
              feedback: { type: "string" }
            }
          },
          cambridge_insight: { type: "string" },
          next_step: { type: "string" }
        }
      }
    }).catch(() => null);
    setLoading(false);
    if (!feedback) {
      setError("Something went wrong. Please try again.");
      return;
    }
    navigate("/feedback", { state: { feedback: feedback.response ?? feedback, answer } });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <TopBar onBack={() => navigate("/")} />

        <div className="flex-1 flex flex-col gap-4 p-4">
          <QuestionCard />
          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0 || loading} loading={loading} onClick={handleSubmit} />
          {error && (
            <p className="text-center text-sm text-red-400/80">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}