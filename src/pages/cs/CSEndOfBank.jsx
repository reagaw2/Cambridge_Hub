import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function CSEndOfBank() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { topicLabel, topicRoute, attempted, correct } = state || {};

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Session complete</h1>
          {topicLabel && (
            <p className="text-sm text-muted-foreground">
              You've worked through all questions in <span className="text-foreground font-medium">{topicLabel}</span>.
            </p>
          )}
          {attempted !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {correct ?? 0} of {attempted} answered correctly this session.
            </p>
          )}
        </div>
        <p className="text-sm text-foreground/60 leading-relaxed max-w-xs">
          Questions you didn't get full marks on have been added to your review bank — they'll unlock in 24 hours for spaced repetition practice.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {topicRoute && (
            <button
              onClick={() => navigate(topicRoute)}
              className="w-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Start again →
            </button>
          )}
          <button
            onClick={() => navigate("/cs")}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Back to CS dashboard
          </button>
        </div>
      </div>
    </div>
  );
}