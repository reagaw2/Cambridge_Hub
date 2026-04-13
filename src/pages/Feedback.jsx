import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Flame } from "lucide-react";

function RingProgress({ value, max }) {
  const size = 80;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-2xl font-bold text-primary">{value}</span>
      </div>
    </div>
  );
}

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { feedback } = state || {};
  console.log("Feedback data:", feedback);

  if (!feedback) {
    navigate("/");
    return null;
  }

  const marks = [feedback.mark_1, feedback.mark_2].filter(Boolean);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar — matches QuestionAttempt exactly */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            9702/44 · May/Jun 2025
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Marks earned */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
            <RingProgress value={feedback.marks_earned ?? 0} max={2} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Marks earned</p>
              <p className="font-mono text-sm text-foreground/60">{feedback.marks_earned} out of 2</p>
            </div>
          </div>

          {/* Mark breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mark Breakdown</h3>
            {marks.map((mark, i) => (
              <div
                key={i}
                className={`pl-4 border-l-2 ${mark.earned ? "border-primary" : "border-red-400/60"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {mark.earned
                    ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />
                  }
                  <span className="font-mono text-xs text-muted-foreground">
                    B1 — "{mark.keyword}"
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{mark.feedback}</p>
              </div>
            ))}
          </div>

          {/* Cambridge insight */}
          <div className="bg-card border border-l-4 border-border border-l-primary rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Cambridge Insight</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
          </div>

          {/* Next step — banner style */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Next Step</p>
            <p className="text-sm text-primary leading-relaxed font-medium">{feedback.next_step}</p>
          </div>

          {/* Try Again / Similar Question */}
          <button
            onClick={() => {
              if (feedback.marks_earned < 2) navigate("/reflection", { state });
              else if (state?.isSimilar) navigate("/familiarity-check", { state });
              else navigate("/similar-question");
            }}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {feedback.marks_earned < 2 ? "Try Again" : "Try a similar question →"}
          </button>

          {/* Streak indicator */}
          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="font-mono text-[11px] text-muted-foreground/50">Day 3 streak — Gravitational Fields</span>
          </div>

        </div>
      </div>
    </div>
  );
}