import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { feedback, answer } = state || {};

  if (!feedback) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Feedback</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">
          {/* Score */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Marks earned</span>
            <span className="font-mono text-2xl font-bold text-primary">{feedback.marks_earned} / 2</span>
          </div>

          {/* Mark breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mark Breakdown</h3>
            {[feedback.mark_1, feedback.mark_2].map((mark, i) => (
              <div key={i} className="flex gap-3">
                {mark.earned
                  ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-400/70 shrink-0 mt-0.5" />
                }
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">B1 — "{mark.keyword}"</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{mark.feedback}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cambridge insight */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cambridge Insight</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
          </div>

          {/* Next step */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="text-sm text-primary leading-relaxed">{feedback.next_step}</p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}