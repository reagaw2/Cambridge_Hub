import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "../lib/topicStore";

// ── Main Feedback page ───────────────────────────────────────────────────────
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
  const maxMarks = isQ3 ? 1 : 2;
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;

  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned, { total_marks: maxMarks, question_id: questionId });
        if (!fullMarks && questionId) {
          writeMistakeDna(feedback, questionId, resolvedTopicKey, marksEarned, maxMarks, answer ?? "").catch(() => {});
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback) return null;

  const insight = feedback.cambridge_insight ?? null;
  const nextStep = feedback.next_step ?? null;
  const takeaway = feedback.pulse_layer_1 ?? feedback.step6_takeaway ?? nextStep ?? null;
  const predictionFeedback = feedback.prediction_feedback ?? null;

  // Build mark rows
  const markRows = Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([, val], i) => ({ ...val, notation: val.notation ?? `B${i + 1}` }));

  function handleNext() {
    if (isReview) { navigate("/review"); return; }
    const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + (fullMarks ? 1 : 0);
    sessionStorage.setItem("previous_score", String(marksEarned));
    if (fullMarks) {
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(
        parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1
      ));
      navigate(nextFullRoute ?? "/physics");
    } else {
      sessionStorage.setItem("consecutive_full_marks", "0");
      navigate(nextRetryRoute ?? "/physics");
    }
  }

  const buttonLabel = isReview
    ? (fullMarks ? "Next review question →" : "Try again")
    : (fullMarks ? "Next question →" : "Try Again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9702/44"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Student's answer */}
          {answer && (
            <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{answer}</p>
            </div>
          )}

          {/* Result banner */}
          <div className={`rounded-xl border px-4 py-3.5 flex items-center justify-between ${
            fullMarks ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fullMarks ? "✅" : "❌"}</span>
              <div>
                <p className={`text-sm font-bold ${fullMarks ? "text-green-400" : "text-red-400"}`}>
                  {fullMarks ? "Correct" : "Incorrect"}
                </p>
                {!fullMarks && !isReview && (
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Added to your review bank</p>
                )}
              </div>
            </div>
            <p className={`text-xl font-black tabular-nums ${fullMarks ? "text-green-400" : "text-amber-400"}`}>
              {marksEarned}<span className="text-sm text-muted-foreground font-normal">/{maxMarks}</span>
            </p>
          </div>

          {/* Exam Takeaway */}
          {takeaway && (
            <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 overflow-hidden">
              <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/70 mb-2 flex items-center gap-2">
                <span>📌</span> The Exam Takeaway
              </p>
              <p className="text-sm font-bold text-white leading-snug relative">{takeaway}</p>
            </div>
          )}

          {/* Cambridge Insight */}
          {insight && (
            <div className="bg-card border border-border rounded-xl px-4 py-3.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </div>
          )}

          {/* Mark breakdown */}
          {markRows.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Mark Breakdown</p>
              {markRows.map((m, i) => (
                <div key={i} className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border ${
                  m.earned ? "bg-green-500/[0.07] border-green-500/20" : "bg-red-500/[0.07] border-red-500/20"
                }`}>
                  <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border leading-none shrink-0 mt-0.5 ${
                    m.earned ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/15 text-red-300 border-red-500/25"
                  }`}>
                    {m.notation}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={`text-xs font-semibold leading-snug ${m.earned ? "text-green-200" : "text-red-200"}`}>
                      {m.earned ? "✓" : "✗"} {m.keyword ?? ""}
                    </p>
                    {m.feedback && (
                      <p className="text-[11px] text-white/40 leading-relaxed">{m.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prediction feedback */}
          {isQ3 && student_prediction && predictionFeedback && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Prediction</p>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{predictionFeedback}</p>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {buttonLabel}
          </button>

        </div>
      </div>
    </div>
  );
}