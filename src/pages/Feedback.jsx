import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Flame } from "lucide-react";
import { recordAttempt, addToReviewBank } from "../lib/topicStore";

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

function detectSituation(feedback, isQ3, maxMarks) {
  const marksEarned = feedback.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  if (!fullMarks) return null;

  const previousScore = parseInt(sessionStorage.getItem("previous_score") ?? "-1", 10);
  const consecutiveFull = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10);

  if (previousScore === 0) return "comeback";

  if (isQ3) {
    const predictionFeedback = (feedback.prediction_feedback ?? "").toLowerCase();
    const positiveWords = ["accurate", "correct", "right", "spot on", "exactly", "identified", "knew", "well done", "impressive", "strong"];
    if (positiveWords.some(w => predictionFeedback.includes(w))) return "prediction";
  }

  if (consecutiveFull >= 3) return "mastery";

  return null;
}

// Question metadata map — used to add questions to the review bank
const QUESTION_META = {
  "q1": {
    question_id: "q1",
    topic: "Gravitational Fields",
    question_text: "Describe the gravitational field in the region close to the surface of a planet.",
    mark_scheme: "B1: radial field. B1: directed towards centre of planet.",
    total_marks: 2
  },
  "q2": {
    question_id: "q2",
    topic: "Gravitational Fields",
    question_text: "Explain why the gravitational field strength g can be considered constant close to the surface of a planet.",
    mark_scheme: "B1: changes in height are much smaller than radius of planet. B1: so (radius + height)² ≈ radius².",
    total_marks: 2
  },
  "q3": {
    question_id: "q3",
    topic: "Gravitational Fields",
    question_text: "A student states that the gravitational field strength at the surface of a planet is 9.81 N kg⁻¹. State what is meant by gravitational field strength.",
    mark_scheme: "B1: force per unit mass.",
    total_marks: 1
  },
  "w25_44_Q8a": {
    question_id: "w25_44_Q8a",
    topic: "Nuclear Physics",
    question_text: "State what is meant by a tracer.",
    mark_scheme: "B1: radioactive substance introduced into the body. B1: absorbed by tissues being studied.",
    total_marks: 2
  },
  "w25_44_Q8bii": {
    question_id: "w25_44_Q8bii",
    topic: "Nuclear Physics",
    question_text: "In the decay equation of oxygen-15, a particle Z is produced alongside the daughter nucleus and a positron. State the name of particle Z.",
    mark_scheme: "B1: electron neutrino.",
    total_marks: 1
  },
  "w25_44_Q8ci": {
    question_id: "w25_44_Q8ci",
    topic: "Nuclear Physics",
    question_text: "Define the activity of a sample.",
    mark_scheme: "B1: number of nuclear disintegrations per unit time.",
    total_marks: 1
  }
};

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback, isQ2, isQ3, student_prediction, isReview,
    topicKey, questionId, nextFullRoute, nextRetryRoute, backRoute, paperRef
  } = state || {};

  // Fall back to gravitational fields defaults for backwards compat
  const resolvedTopicKey = topicKey ?? "gravitational_fields";
  const resolvedBack = backRoute ?? "/question";

  const maxMarks = isQ3 ? 1 : 2;
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;

  // Hooks must be called unconditionally
  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned);
        if (!fullMarks && questionId && QUESTION_META[questionId]) {
          addToReviewBank({
            ...QUESTION_META[questionId],
            first_attempt_score: marksEarned,
            first_attempt_feedback: feedback.cambridge_insight ?? ""
          });
        }
      }
    }
  }, []);

  if (!feedback) return null;

  const marks = [feedback.mark_1, feedback.mark_2].filter(Boolean);

  function handleNext() {
    // If coming from review session, go back to review
    if (isReview) {
      navigate("/review");
      return;
    }

    sessionStorage.setItem("previous_score", String(marksEarned));

    if (fullMarks) {
      const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + 1;
      const cfm = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1;
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(cfm));

      const situation = detectSituation(feedback, isQ3, maxMarks);

      // Use passed nextFullRoute, or fall back to old GF logic
      const nextDest = nextFullRoute ?? (isQ3 ? "/" : fmc === 1 ? "/similar-question" : "/familiarity-check");

      if (situation) {
        navigate("/reflection", { state: { situation, nextDest, feedbackState: state } });
      } else {
        navigate(nextDest);
      }
    } else {
      sessionStorage.setItem("consecutive_full_marks", "0");
      const retryDest = nextRetryRoute ?? (isQ3 ? resolvedBack : isQ2 ? "/similar-question" : "/");
      navigate(retryDest);
    }
  }

  const buttonLabel = isReview ? (fullMarks ? "Next review question →" : "Try again") : (fullMarks ? "Try a similar question →" : "Try Again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(resolvedBack)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9702/44 · May/Jun 2025"}
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

          <div className="bg-card border border-l-4 border-border border-l-primary rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Cambridge Insight</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
          </div>

          {isQ3 && student_prediction && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Prediction</h3>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

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
            <span className="font-mono text-[11px] text-muted-foreground/50">Answer contributes to your streak</span>
          </div>

        </div>
      </div>
    </div>
  );
}