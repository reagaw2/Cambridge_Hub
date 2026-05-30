import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, AlertTriangle } from "lucide-react";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "../lib/topicStore";
import PulseFeedback from "@/components/PulseFeedback";
import { detectSubject } from "@/lib/pulsePromptBuilder";

const QUESTION_META = {
  "9702-22-W19-Q1a": { question_id: "9702-22-W19-Q1a", topic: "Physical Quantities & Units", question_text: "Distinguish between vector and scalar quantities.", mark_scheme: "B1: a scalar quantity has magnitude only. B1: a vector quantity has both magnitude and direction.", total_marks: 2 },
  "9702-41-W19-Q2a": { question_id: "9702-41-W19-Q2a", topic: "Thermal Physics", question_text: "State the assumption of kinetic theory that is related to the volume of the molecules of the gas.", mark_scheme: "M1: volume of molecules is negligible. A1: compared with the volume occupied by the gas.", total_marks: 2 },
  "w25_44_Q8a": { question_id: "w25_44_Q8a", topic: "Nuclear Physics", question_text: "State what is meant by a tracer.", mark_scheme: "B1: radioactive substance introduced into the body. B1: absorbed by tissues being studied.", total_marks: 2 },
  "w25_44_Q1a": { question_id: "w25_44_Q1a", topic: "Gravitational Fields", question_text: "State Newton's law of gravitation.", mark_scheme: "B1: proportional to product of masses. B1: inversely proportional to square of separation.", total_marks: 2 },
  "w25_44_Q3a": { question_id: "w25_44_Q3a", topic: "Thermal Physics", question_text: "Explain what is meant by the internal energy of an ideal gas.", mark_scheme: "B1: total KE of random motion. B1: PE is zero.", total_marks: 2 },
  "w25_44_Q7a": { question_id: "w25_44_Q7a", topic: "Electromagnetic Induction", question_text: "State Lenz's law.", mark_scheme: "M1: direction of induced e.m.f. A1: opposes the change that caused it.", total_marks: 2 },
  "w25_44_Q9a": { question_id: "w25_44_Q9a", topic: "Quantum Physics", question_text: "State what is meant by the photoelectric effect.", mark_scheme: "M1: emission of electrons from metal. A1: when EM radiation is incident.", total_marks: 2 },
  "w25_44_Q10a": { question_id: "w25_44_Q10a", topic: "Astrophysics", question_text: "State what is meant by redshift.", mark_scheme: "B1: recession causes emitted light to shift. B1: increase in wavelength.", total_marks: 2 },
};

function detectSituationFromFeedback(feedback, isQ3, maxMarks) {
  const marksEarned = feedback.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  if (!fullMarks) return null;
  const previousScore = parseInt(sessionStorage.getItem("previous_score") ?? "-1", 10);
  if (previousScore === 0) return "comeback";
  if (isQ3) {
    const predictionFeedback = (feedback.prediction_feedback ?? "").toLowerCase();
    const positiveWords = ["accurate", "correct", "right", "spot on", "exactly", "identified", "knew", "well done", "impressive", "strong"];
    if (positiveWords.some(w => predictionFeedback.includes(w))) return "prediction";
  }
  const consecutiveFull = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10);
  if (consecutiveFull >= 3) return "mastery";
  return null;
}

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback, answer, isQ2, isQ3, student_prediction, isReview,
    isPersistentMisunderstanding,
    topicKey, questionId, nextFullRoute, nextRetryRoute, backRoute, paperRef
  } = state || {};

  const resolvedTopicKey = topicKey ?? "gravitational_fields";
  const resolvedBack = backRoute ?? "/physics";
  const metaEntry = questionId ? QUESTION_META[questionId] : null;
  const maxMarks = metaEntry ? metaEntry.total_marks : (isQ3 ? 1 : 2);
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  const subject = detectSubject(resolvedTopicKey);
  const questionText = metaEntry?.question_text ?? "";

  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned, { total_marks: maxMarks, question_id: questionId });
        if (!fullMarks) {
          writeMistakeDna(feedback, questionId, metaEntry?.topic ?? resolvedTopicKey, marksEarned, maxMarks, answer ?? "").catch(() => {});
          if (questionId && QUESTION_META[questionId]) {
            addToReviewBank({
              ...QUESTION_META[questionId],
              first_attempt_score: marksEarned,
              first_attempt_feedback: feedback.cambridge_insight ?? "",
              first_attempt_answer: answer ?? "",
            });
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback) return null;

  function handleNext() {
    if (isReview) { navigate("/review"); return; }
    sessionStorage.setItem("previous_score", String(marksEarned));
    if (fullMarks) {
      const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + 1;
      const cfm = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1;
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(cfm));
      const situation = detectSituationFromFeedback(feedback, isQ3, maxMarks);
      const nextDest = nextFullRoute ?? (isQ3 ? "/physics" : "/physics");
      const topicDisplayName = metaEntry?.topic ?? resolvedTopicKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      if (situation) {
        navigate("/reflection", { state: { situation, nextDest, feedbackState: state, topicName: topicDisplayName } });
      } else {
        navigate(nextDest);
      }
    } else {
      sessionStorage.setItem("consecutive_full_marks", "0");
      const retryDest = nextRetryRoute ?? "/physics";
      navigate(retryDest);
    }
  }

  const buttonLabel = isReview
    ? (fullMarks ? "Next review question →" : "Try again")
    : (fullMarks ? "Next question →" : "Try Again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">
            {subject === "cs" ? "CAIE Computer Science" : "CAIE Physics"}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9702/44"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Persistent misunderstanding banner */}
          {isPersistentMisunderstanding && (
            <div className="bg-red-500/12 border border-red-500/35 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-400">⚠ Persistent Misunderstanding</p>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  You gave a very similar answer to your last attempt. The AI has specifically addressed this recurring mistake in the insight below — read it carefully before your next try.
                </p>
              </div>
            </div>
          )}

          <PulseFeedback
            feedback={feedback}
            subject={subject}
            marksTotal={maxMarks}
            questionId={questionId}
            questionText={questionText}
            studentAnswer={answer ?? ""}
          />

          {isQ3 && student_prediction && feedback.prediction_feedback && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Prediction</p>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

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