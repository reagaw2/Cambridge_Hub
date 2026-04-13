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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-2xl font-bold text-primary">{value}</span>
      </div>
    </div>
  );
}

// Determine which affirmation situation applies, if any
function detectSituation(feedback, isQ3, maxMarks) {
  const marksEarned = feedback.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  if (!fullMarks) return null;

  const previousScore = parseInt(sessionStorage.getItem("previous_score") ?? "-1", 10);
  const consecutiveFull = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10);

  // Situation 1 — comeback: previously scored 0, now full marks
  if (previousScore === 0) return "comeback";

  // Situation 2 — accurate prediction on Q3
  if (isQ3) {
    const predictionFeedback = (feedback.prediction_feedback ?? "").toLowerCase();
    const positiveWords = ["accurate", "correct", "right", "spot on", "exactly", "identified", "knew", "well done", "impressive", "strong"];
    const isAccurate = positiveWords.some(w => predictionFeedback.includes(w));
    if (isAccurate) return "prediction";
  }

  // Situation 3 — 3 consecutive full marks (count updated before this check)
  if (consecutiveFull >= 3) return "mastery";

  return null;
}

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { feedback, isQ2, isQ3, student_prediction } = state || {};

  if (!feedback) { navigate("/"); return null; }

  const maxMarks = isQ3 ? 1 : 2;
  const marks = [feedback.mark_1, feedback.mark_2].filter(Boolean);
  const marksEarned = feedback.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;

  function handleNext() {
    // Store current score as previous_score for next attempt on same question
    sessionStorage.setItem("previous_score", String(marksEarned));

    // Record score for trend tracking
    const scores = JSON.parse(sessionStorage.getItem("gf_scores") ?? "[]");
    scores.push(marksEarned);
    sessionStorage.setItem("gf_scores", JSON.stringify(scores));

    // Update streak
    const today = new Date().toDateString();
    const lastAttempt = sessionStorage.getItem("gf_last_attempt_date");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let streak = parseInt(sessionStorage.getItem("gf_streak") ?? "0", 10);
    if (lastAttempt !== today) {
      streak = lastAttempt === yesterday ? streak + 1 : 1;
      sessionStorage.setItem("gf_streak", String(streak));
    }
    sessionStorage.setItem("gf_last_attempt_date", today);
    console.log("[ALA Hub] gf_scores:", scores, "| streak:", streak);

    if (fullMarks) {
      // Increment full_marks_count and consecutive_full_marks
      const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + 1;
      const cfm = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1;
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(cfm));
      console.log("[ALA Hub] full_marks_count updated to:", fmc, "| consecutive_full_marks:", cfm);

      const situation = detectSituation(feedback, isQ3, maxMarks);

      // Determine next destination
      let nextDest;
      if (isQ3) {
        nextDest = "/";
      } else if (fmc === 1) {
        nextDest = "/similar-question";
      } else {
        nextDest = "/familiarity-check";
      }

      if (situation) {
        navigate("/reflection", {
          state: {
            situation,
            nextDest,
            feedbackState: state,
          }
        });
      } else {
        navigate(nextDest);
      }
    } else {
      // Wrong — reset consecutive streak, navigate back to same question
      sessionStorage.setItem("consecutive_full_marks", "0");
      if (isQ3) navigate("/familiarity-check", { state });
      else if (isQ2) navigate("/similar-question");
      else navigate("/");
    }
  }

  const buttonLabel = fullMarks ? "Try a similar question →" : "Try Again";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

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
            <RingProgress value={marksEarned} max={maxMarks} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Marks earned</p>
              <p className="font-mono text-sm text-foreground/60">{marksEarned} out of {maxMarks}</p>
            </div>
          </div>

          {/* Mark breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mark Breakdown</h3>
            {marks.map((mark, i) => (
              <div key={i} className={`pl-4 border-l-2 ${mark.earned ? "border-primary" : "border-red-400/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {mark.earned
                    ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />
                  }
                  <span className="font-mono text-xs text-muted-foreground">B1 — "{mark.keyword}"</span>
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

          {/* Your prediction — Q3 only */}
          {isQ3 && student_prediction && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Prediction</h3>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

          {/* Next step */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Next Step</p>
            <p className="text-sm text-primary leading-relaxed font-medium">{feedback.next_step}</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {buttonLabel}
          </button>

          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="font-mono text-[11px] text-muted-foreground/50">Day 3 streak — Gravitational Fields</span>
          </div>

        </div>
      </div>
    </div>
  );
}