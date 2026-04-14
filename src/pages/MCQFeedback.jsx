import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Placeholder — will be fully built in Fix 2
export default function MCQFeedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { feedback, attemptData, question, topic } = state || {};

  if (!feedback || !attemptData) {
    navigate("/");
    return null;
  }

  const isCorrect = attemptData.correct;

  function handleNext() {
    navigate("/mcq", { state: { topic } });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {question?.source}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">
          <div className={`rounded-xl p-4 border ${isCorrect ? "bg-primary/10 border-primary/30" : "bg-red-400/10 border-red-400/30"}`}>
            <p className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-red-400"}`}>
              {isCorrect ? "Correct!" : `Incorrect — correct answer is ${attemptData.correct_option}: ${feedback.correct_text}`}
            </p>
          </div>

          {feedback.answer_explanation && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explanation</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.answer_explanation}</p>
            </div>
          )}

          {feedback.next_step && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">Next Step</p>
              <p className="text-sm text-primary leading-relaxed font-medium">{feedback.next_step}</p>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Next Question →
          </button>
        </div>
      </div>
    </div>
  );
}