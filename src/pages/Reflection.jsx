import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SITUATION_TEXT = {
  comeback: "Before this session, you got this wrong. Just now, you got it right. That gap is exactly what Cambridge rewards.",
  prediction: "You predicted what Cambridge wanted before you even answered. That is Cambridge thinking. That is the skill.",
  mastery: "Three consecutive full marks on Gravitational Fields. You are not just answering questions. You are learning to think like an examiner.",
};

export default function Reflection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { situation, nextDest, feedbackState } = state || {};

  const [step, setStep] = useState("prompt");
  const [message, setMessage] = useState(null);

  const situationText = SITUATION_TEXT[situation] ?? SITUATION_TEXT.comeback;

  function handleYes() {
    setMessage("That confidence is earned. Keep building on it.");
    setStep("done");
  }

  function handleLucky() {
    setMessage("Honesty is a good sign. Read the Cambridge insight once more before your next attempt.");
    setStep("review");
  }

  useEffect(() => {
    if (step === "done") {
      const t = setTimeout(() => navigate(nextDest ?? "/"), 2000);
      return () => clearTimeout(t);
    }
  }, [step, navigate, nextDest]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center relative">
      <button
        onClick={() => navigate("/feedback", { state: feedbackState })}
        className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-secondary transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      {step === "prompt" && (
        <div className="flex flex-col items-center gap-10 w-full max-w-sm">
          <p className="text-xl font-semibold text-foreground leading-relaxed">{situationText}</p>
          <div className="w-px h-8 bg-border/50" />
          <p className="text-lg font-semibold text-foreground leading-relaxed">
            Do you understand why you got this right?
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleYes}
              className="w-full py-4 rounded-2xl bg-primary/15 text-primary font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Yes, I can explain it
            </button>
            <button
              onClick={handleLucky}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              I got lucky
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <p className="text-lg font-semibold text-primary leading-relaxed max-w-sm">{message}</p>
      )}

      {step === "review" && (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          <p className="text-base text-foreground/80 leading-relaxed">{message}</p>
          <button
            onClick={() => navigate("/feedback", { state: feedbackState })}
            className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Review insight
          </button>
        </div>
      )}

    </div>
  );
}