import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "../components/TopBar";
import QuestionCard from "../components/QuestionCard";
import AnswerInput from "../components/AnswerInput";
import SubmitButton from "../components/SubmitButton";

const QUESTION = {
  label: "Question 1(c)(i)",
  topic: "Gravitational Fields",
  text: "A student states that the gravitational field strength at the surface of a planet is 9.81 N kg⁻¹. State what is meant by gravitational field strength.",
  marks: "[1 mark]",
};

export default function FamiliarityCheck() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Show prediction stage only when full_marks_count === 2 (second full-marks, going to Q3)
  const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10);
  console.log("[ALA Hub] FamiliarityCheck — full_marks_count:", fmc);
  const [stage, setStage] = useState(fmc >= 2 ? "prediction" : "answer");
  const [prediction, setPrediction] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student has just completed two questions on gravitational fields and scored full marks on both. Now on their third question they were asked to predict the mark scheme before answering.

Question: "${QUESTION.text}"
Mark scheme: B1: force per unit mass — or equivalent
Student's prediction of what Cambridge wants: "${prediction}"
Student's actual answer: "${answer}"

Analyse both inputs and respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 1],
  "mark_1": { "earned": true or false, "keyword": "force per unit mass", "found": true or false, "feedback": "one sentence" },
  "cambridge_insight": "two sentences explaining what Cambridge is testing here",
  "prediction_feedback": "two to three sentences specifically addressing how accurate their prediction was, what this reveals about their developing Cambridge thinking, and one thing to sharpen for next time. Warm and encouraging tone.",
  "next_step": "one sentence on what to focus on next"
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
          cambridge_insight: { type: "string" },
          prediction_feedback: { type: "string" },
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
        isQ3: true,
        student_prediction: prediction,
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 flex flex-col gap-4 p-4">
          <QuestionCard {...QUESTION} />

          {stage === "prediction" && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Before You Answer</p>
              <p className="text-base font-semibold text-foreground leading-snug">
                What do you think Cambridge is looking for here?
              </p>
              <textarea
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="Write your prediction — what keywords or ideas do you think the mark scheme requires?"
                rows={4}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              <button
                onClick={() => setStage("answer")}
                disabled={prediction.trim().length === 0}
                className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                I'm ready to answer →
              </button>
            </div>
          )}

          {stage === "answer" && (
            <>
              <AnswerInput value={answer} onChange={setAnswer} />
              <SubmitButton
                disabled={answer.trim().length === 0 || loading}
                loading={loading}
                onClick={handleSubmit}
              />
              {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}