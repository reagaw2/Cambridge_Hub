import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LINES = [
  "Last time this question stopped you.",
  "This time you answered it correctly.",
  "That gap is exactly what revision is for."
];

export default function ReviewAffirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { bankEmpty, updatedBank } = state || {};

  const [visibleLines, setVisibleLines] = useState(0);
  const [showBankCleared, setShowBankCleared] = useState(false);

  useEffect(() => {
    // reveal lines one at a time: 0ms, 1000ms, 2000ms
    const timers = LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), i * 1000)
    );

    // after all lines shown + 2s pause, proceed
    const nav = setTimeout(() => {
      if (bankEmpty) {
        setShowBankCleared(true);
        setTimeout(() => navigate("/physics"), 2000);
      } else {
        navigate("/review", { replace: true });
      }
    }, LINES.length * 1000 + 2000);

    return () => { timers.forEach(clearTimeout); clearTimeout(nav); };
  }, []);

  if (showBankCleared) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-10 text-center">
        <p className="text-lg font-semibold text-foreground max-w-sm leading-relaxed">
          Review bank cleared. Every question that challenged you has been answered.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-10 text-center gap-8">
      {LINES.map((line, i) => (
        <p
          key={i}
          className="text-xl font-semibold text-foreground max-w-sm leading-relaxed transition-opacity duration-700"
          style={{ opacity: visibleLines > i ? 1 : 0 }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}