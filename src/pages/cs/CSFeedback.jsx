import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import PulseFeedback from "@/components/PulseFeedback";

export default function CSFeedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback,
    answer,
    totalMarks,
    backRoute,
    dashRoute,
    paperRef,
    isReview,
    topicRoute,
    topicLabel,
    isLastQuestion,
    questionId,
  } = state || {};

  if (!feedback) { navigate("/cs"); return null; }

  const partFeedbacks = feedback?.part_feedbacks ?? null;
  const marksEarned = feedback.marks_earned ?? 0;
  const maxMarks = totalMarks ?? 1;
  const fullMarks = marksEarned >= maxMarks;

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

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={() => navigate(dashRoute ?? "/cs")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Computer Science</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9618"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Multi-part breakdown */}
          {partFeedbacks && partFeedbacks.length > 1 ? (
            <div className="space-y-4">
              {/* Overall score */}
              <div className={`rounded-xl border p-4 flex items-center justify-between ${
                fullMarks ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"
              }`}>
                <div>
                  <p className="text-sm font-bold text-foreground">Total Score</p>
                  <p className="text-[11px] text-muted-foreground">{partFeedbacks.length} sub-parts answered</p>
                </div>
                <span className={`text-2xl font-black font-mono ${fullMarks ? "text-green-400" : "text-amber-400"}`}>
                  {marksEarned}<span className="text-sm text-muted-foreground font-normal">/{maxMarks}</span>
                </span>
              </div>

              {/* Per-part results */}
              {partFeedbacks.map((pf, i) => {
                const partFull = pf.marks_earned >= pf.total_marks;
                return (
                  <div key={i} className={`bg-card border rounded-xl p-4 space-y-3 ${
                    partFull ? "border-green-500/25" : "border-red-500/20"
                  }`}>
                    {/* Part header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {partFull
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />}
                        <span className="font-mono text-xs font-bold text-blue-400">
                          Part {pf.label ?? `${i + 1}`}
                        </span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${partFull ? "text-green-400" : "text-red-400"}`}>
                        {pf.marks_earned}/{pf.total_marks}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="text-xs text-muted-foreground leading-relaxed">{pf.question}</p>

                    {/* Student answer */}
                    <div className="bg-secondary/40 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Your answer</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{pf.answer}</p>
                    </div>

                    {/* Mark breakdown */}
                    {[pf.mark_1, pf.mark_2].filter(Boolean).map((m, j) => (
                      <div key={j} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                        m.earned ? "bg-green-500/8 border border-green-500/20 text-green-300" : "bg-red-500/8 border border-red-500/20 text-red-300"
                      }`}>
                        <span className="font-bold shrink-0">{m.earned ? "✓" : "✗"}</span>
                        <span>{m.keyword} — {m.feedback}</span>
                      </div>
                    ))}

                    {/* Insight */}
                    {pf.cambridge_insight && (
                      <div className="bg-primary/8 border border-primary/20 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60 mb-0.5">Insight</p>
                        <p className="text-xs text-foreground/80 leading-relaxed">{pf.cambridge_insight}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single-part: use existing PulseFeedback */
            <PulseFeedback
              feedback={feedback}
              subject="cs"
              marksTotal={maxMarks}
              questionId={questionId}
              questionText={feedback?.question_text ?? ""}
              studentAnswer={answer ?? ""}
            />
          )}

          {/* Primary action */}
          <button
            onClick={handlePrimary}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {primaryLabel}
          </button>

          {/* Secondary nav */}
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