import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { recordCSAttempt } from "@/lib/topicStore";

function RingProgress({ value, max }) {
  const size = 80;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#60a5fa" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-2xl font-bold text-blue-400">{value}</span>
      </div>
    </div>
  );
}

export default function CSFeedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { feedback, totalMarks, backRoute, dashRoute, paperRef, isReview, topicRoute, topicLabel, attempted, correct, isLastQuestion, topicKey, questionId } = state || {};

  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback || !user?.email || recorded.current) return;
    recorded.current = true;
    const score = feedback.marks_earned ?? 0;
    recordCSAttempt(user.email, topicKey, score, totalMarks, questionId);
    console.log("[csStore] recordCSAttempt called — topic:", topicKey, "score:", score, "/", totalMarks);
  }, []);

  if (!feedback) { navigate("/cs"); return null; }

  const marksEarned = feedback.marks_earned ?? 0;
  const maxMarks = totalMarks ?? 1;
  const fullMarks = marksEarned >= maxMarks;
  const marks = [feedback.mark_1, feedback.mark_2, feedback.mark_3, feedback.mark_4, feedback.mark_5, feedback.mark_6].filter(Boolean);

  // For review mode: full marks → back to review bank; wrong → try again (same review question)
  // For normal mode: full marks → next question (topicRoute). If last question → end-of-bank. Wrong → retry same topic.
  function handlePrimary() {
    if (isReview) {
      navigate(fullMarks ? "/cs/review-bank" : backRoute ?? "/cs/review-session");
    } else {
      if (fullMarks && isLastQuestion) {
        navigate("/cs/end-of-bank", { state: { topicLabel, topicRoute: backRoute } });
      } else if (fullMarks && topicRoute) {
        navigate(topicRoute);
      } else {
        navigate(backRoute ?? "/cs");
      }
    }
  }

  const primaryLabel = isReview
    ? (fullMarks ? "Back to review bank →" : "Try again")
    : (fullMarks ? "Next question →" : "Try again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(dashRoute ?? "/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Computer Science</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9618"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
            <RingProgress value={marksEarned} max={maxMarks} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Marks earned</p>
              <p className="font-mono text-sm text-foreground/60">{marksEarned} out of {maxMarks}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mark Breakdown</h3>
            {marks.map((mark, i) => (
              <div key={i} className={`pl-4 border-l-2 ${mark.earned ? "border-blue-400" : "border-red-400/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {mark.earned
                    ? <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />
                  }
                  <span className="font-mono text-xs text-muted-foreground">B1 — "{mark.keyword}"</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{mark.feedback}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-l-4 border-border border-l-blue-400 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-400">Cambridge Insight</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">Next Step</p>
            <p className="text-sm text-blue-300 leading-relaxed font-medium">{feedback.next_step}</p>
          </div>

          <button
            onClick={handlePrimary}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {primaryLabel}
          </button>

          {/* Secondary nav links */}
          <div className="flex items-center justify-center gap-6">
            {isReview && (
              <button onClick={() => navigate("/cs/review-bank")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Review bank
              </button>
            )}
            <button onClick={() => navigate("/cs")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              CS dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}