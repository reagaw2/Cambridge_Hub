import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const STEP = {
  FIRST: "first",
  SECOND: "second",
  CELEBRATE: "celebrate",
  UNSURE: "unsure",
};

export default function Reflection() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [step, setStep] = useState(STEP.FIRST);

  useEffect(() => {
    if (step === STEP.CELEBRATE) {
      const t = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(t);
    }
  }, [step, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">

      {step === STEP.FIRST && (
        <div className="flex flex-col items-center gap-10 animate-fade-in">
          <p className="text-xl font-semibold text-foreground leading-relaxed max-w-xs">
            Before this question, did you know why Cambridge requires the word 'radial' here?
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setStep(STEP.SECOND)}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              No, I didn't know
            </button>
            <button
              onClick={() => { setTimeout(() => navigate("/"), 1000); setStep(null); }}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Yes, I already knew
            </button>
          </div>
        </div>
      )}

      {step === STEP.SECOND && (
        <div className="flex flex-col items-center gap-10 animate-fade-in">
          <p className="text-xl font-semibold text-foreground leading-relaxed max-w-xs">
            Do you understand it now?
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setStep(STEP.CELEBRATE)}
              className="w-full py-4 rounded-2xl bg-primary/15 text-primary font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Yes, I get it now
            </button>
            <button
              onClick={() => setStep(STEP.UNSURE)}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Still not sure
            </button>
          </div>
        </div>
      )}

      {step === STEP.CELEBRATE && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <p className="text-lg font-semibold text-primary leading-relaxed max-w-xs">
            That's the growth. Cambridge can't take that from you.
          </p>
        </div>
      )}

      {step === STEP.UNSURE && (
        <div className="flex flex-col items-center gap-10 animate-fade-in">
          <p className="text-base text-foreground/80 leading-relaxed max-w-xs">
            No problem. Read the Cambridge insight again, then try once more.
          </p>
          <button
            onClick={() => navigate("/feedback", { state })}
            className="w-full max-w-xs py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Go back to feedback
          </button>
        </div>
      )}

      {step === null && (
        <p className="text-sm text-muted-foreground font-mono">Returning…</p>
      )}

    </div>
  );
}