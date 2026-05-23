import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STAGES = [
  { label: "Submitting your answer…", delay: 0 },
  { label: "AI is analysing your response…", delay: 1800 },
  { label: "Comparing against mark scheme…", delay: 4000 },
  { label: "Generating detailed score…", delay: 6500 },
  { label: "Almost there…", delay: 9500 },
];

function Overlay() {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const timers = STAGES.slice(1).map((stage, i) =>
      setTimeout(() => setStageIdx(i + 1), stage.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const label = STAGES[Math.min(stageIdx, STAGES.length - 1)].label;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="bg-[#0d0d1a]/95 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <div className="flex flex-col items-center gap-6 text-center max-w-xs">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">{label}</p>
          <div className="flex items-center justify-center gap-1.5">
            {STAGES.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= stageIdx ? "bg-primary w-4" : "bg-white/10 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50 leading-relaxed">
          Cambridge-standard AI marking takes a moment to get right.
        </p>
      </div>
    </div>,
    document.body
  );
}

export default Overlay;