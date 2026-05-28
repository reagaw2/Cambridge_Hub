import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

          {/* Unified 3-Layer Pulse Engine with Socratic context */}
          <PulseFeedback
            feedback={feedback}
            subject="cs"
            marksTotal={maxMarks}
            questionId={questionId}
            questionText={feedback?.question_text ?? ""}
            studentAnswer={answer ?? ""}
          />

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
              <button
                onClick={() => navigate("/cs/review-bank")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Review bank
              </button>
            )}
            <button
              onClick={() => navigate("/cs")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              CS dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}