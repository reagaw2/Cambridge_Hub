import { useLocation, useNavigate } from "react-router-dom";

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
    topicKey,
  } = state || {};

  if (!feedback) { navigate("/cs"); return null; }

  const marksEarned = feedback.marks_earned ?? 0;
  const maxMarks = totalMarks ?? 1;
  const fullMarks = marksEarned >= maxMarks;
  const takeaway = feedback.pulse_layer_1 ?? feedback.cambridge_insight ?? null;
  const insight = feedback.cambridge_insight ?? null;
  const topic = topicLabel ?? topicKey ?? "";

  // Build mark rows
  const markRows = Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([, val], i) => ({ ...val, notation: val.notation ?? `B${i + 1}` }));

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
          <button onClick={() => navigate(dashRoute ?? "/cs")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Computer Science</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9618"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Student answer */}
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
            <div className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-5 overflow-hidden">
              <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-violet-400/10 blur-xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-400/70 mb-2 flex items-center gap-2">
                <span>📌</span> The Exam Takeaway
              </p>
              <p className="text-sm font-bold text-white leading-snug relative">{takeaway}</p>
            </div>
          )}

          {/* Cambridge Insight */}
          {insight && insight !== takeaway && (
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
                    {m.feedback && <p className="text-[11px] text-white/40 leading-relaxed">{m.feedback}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Primary action */}
          <button
            onClick={handlePrimary}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {primaryLabel}
          </button>

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