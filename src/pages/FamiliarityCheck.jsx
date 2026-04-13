import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const MARK_SCHEME_TEXT = `B1: Changes in height are very much smaller than the radius of the planet.
B1: So (radius + height) squared is approximately equal to radius squared — meaning the distance from the centre barely changes.`;

export default function FamiliarityCheck() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `A Cambridge Physics student has predicted what the examiner is looking for. Compare their prediction to the actual mark scheme and respond encouragingly. Tell them specifically what they got right in their prediction, what they missed, and what this shows about how their Cambridge thinking is developing. Keep the response to three sentences maximum. Warm and precise tone.

Student's prediction: "${prediction}"

Actual mark scheme:
${MARK_SCHEME_TEXT}`,
      model: "claude_sonnet_4_6",
    }).catch(() => null);
    setLoading(false);
    const responseText = typeof result === "string" ? result : result?.response ?? result?.text ?? JSON.stringify(result);
    navigate("/familiarity-result", { state: { ...state, claudeResponse: responseText } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        <p className="text-xl font-semibold text-foreground leading-relaxed text-center">
          Based on what you have seen so far — what do you think Cambridge is looking for in this type of question?
        </p>
        <textarea
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          placeholder="Type your prediction here…"
          rows={5}
          className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={prediction.trim().length === 0 || loading}
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Checking…" : "See if you're right"}
        </button>
      </div>
    </div>
  );
}