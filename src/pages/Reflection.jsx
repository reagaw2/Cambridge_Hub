import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const STEP = { FIRST: "first", SECOND: "second", CELEBRATE: "celebrate", UNSURE: "unsure", LEAVING: "leaving" };

function buildQuestion(feedback) {
  const missed = [feedback?.mark_1, feedback?.mark_2].find(m => m && !m.earned);
  if (!missed) return "Before this session, did you know what Cambridge is looking for here?";
  const kw = missed.keyword?.toLowerCase() ?? "";
  if (kw.includes("radial")) return "Before this session, did you know that Cambridge requires the word 'radial' specifically?";
  if (kw.includes("centre") || kw.includes("center") || kw.includes("direction") || kw.includes("towards"))
    return "Before this session, did you know Cambridge requires you to state the direction of the field?";
  return `Before this session, did you know Cambridge requires you to mention '${missed.keyword}'?`;
}

export default function Reflection() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const feedback = state?.feedback;
  const [step, setStep] = useState(STEP.FIRST);

  useEffect(() => {
    const dest = state?.isSimilar ? "/similar-question" : "/";
    if (step === STEP.CELEBRATE) {
      const t = setTimeout(() => navigate(dest), 2000);
      return () => clearTimeout(t);
    }
    if (step === STEP.LEAVING) {
      const t = setTimeout(() => navigate(dest), 1000);
      return () => clearTimeout(t);
    }
  }, [step, navigate]);

  const question = buildQuestion(feedback);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">

      {step === STEP.FIRST && (
        <div className="flex flex-col items-center gap-10 w-full max-w-xs">
          <p className="text-xl font-semibold text-foreground leading-relaxed">{question}</p>
          <div className="flex flex-col gap-3 w-full">
            <button onClick={() => setStep(STEP.SECOND)}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all">
              No, I didn't know
            </button>
            <button onClick={() => setStep(STEP.LEAVING)}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all">
              Yes, I already knew
            </button>
          </div>
        </div>
      )}

      {step === STEP.SECOND && (
        <div className="flex flex-col items-center gap-10 w-full max-w-xs">
          <p className="text-xl font-semibold text-foreground leading-relaxed">Do you understand it now?</p>
          <div className="flex flex-col gap-3 w-full">
            <button onClick={() => setStep(STEP.CELEBRATE)}
              className="w-full py-4 rounded-2xl bg-primary/15 text-primary font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all">
              Yes, I get it now
            </button>
            <button onClick={() => setStep(STEP.UNSURE)}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all">
              Still not sure
            </button>
          </div>
        </div>
      )}

      {step === STEP.CELEBRATE && (
        <p className="text-lg font-semibold text-primary leading-relaxed max-w-xs">
          That's the growth. Cambridge can't take that from you.
        </p>
      )}

      {step === STEP.UNSURE && (
        <div className="flex flex-col items-center gap-10 w-full max-w-xs">
          <p className="text-base text-foreground/80 leading-relaxed">
            No problem. Read the Cambridge insight again, then try once more.
          </p>
          <button onClick={() => navigate("/feedback", { state })}
            className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground/70 font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all">
            Go back to feedback
          </button>
        </div>
      )}

      {step === STEP.LEAVING && (
        <p className="text-sm text-muted-foreground font-mono">Returning…</p>
      )}

    </div>
  );
}