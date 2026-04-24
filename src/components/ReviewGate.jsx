/**
 * ReviewGate — shown when student has 5+ review bank questions
 * and hasn't opened the app for 18+ hours.
 * Must complete 3 attempts to unlock topic navigation.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckSquare } from "lucide-react";
import { getReviewBank, getGuessReviewBank } from "@/lib/topicStore";
import { csGetReviewBank } from "@/lib/csTopicStore";

export default function ReviewGate({ writtenCount, mcqCount, onComplete }) {
  const navigate = useNavigate();
  const [attemptsCompleted, setAttemptsCompleted] = useState(0);
  const required = 3;
  const totalWaiting = writtenCount + mcqCount;

  // Listen for route changes that signal a question was completed
  // We use sessionStorage to pass "gate_attempt_done" signals
  useEffect(() => {
    const checkSignal = () => {
      const sig = sessionStorage.getItem("review_gate_attempt");
      if (sig) {
        sessionStorage.removeItem("review_gate_attempt");
        setAttemptsCompleted(prev => {
          const next = prev + 1;
          if (next >= required) {
            setTimeout(() => onComplete(), 400);
          }
          return next;
        });
      }
    };

    // Poll for signal (simple approach for cross-page communication)
    const interval = setInterval(checkSignal, 500);
    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = Math.min(attemptsCompleted / required, 1);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex justify-center overflow-y-auto">
      <div className="w-full max-w-[480px] flex flex-col p-6 pt-12 gap-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Before we dive in
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            You have <span className="text-amber-400 font-semibold">{totalWaiting} question{totalWaiting !== 1 ? "s" : ""}</span> waiting from your last session. Work through 3 to get going again.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Progress</span>
            <span className="font-mono text-sm font-bold text-foreground">{attemptsCompleted} / {required}</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          {attemptsCompleted >= required && (
            <p className="text-sm text-green-400 font-semibold text-center">All done — unlocking now...</p>
          )}
        </div>

        {/* Bank cards */}
        <div className="space-y-3">
          {writtenCount > 0 && (
            <button
              onClick={() => navigate("/review")}
              className="w-full bg-card border border-border border-l-4 border-l-amber-500/60 rounded-xl p-4 text-left hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Written Questions</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{writtenCount} question{writtenCount !== 1 ? "s" : ""} waiting</p>
                </div>
              </div>
            </button>
          )}
          {mcqCount > 0 && (
            <button
              onClick={() => navigate("/guess-review-bank")}
              className="w-full bg-card border border-border border-l-4 border-l-primary/60 rounded-xl p-4 text-left hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">☑</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Multiple Choice</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mcqCount} question{mcqCount !== 1 ? "s" : ""} waiting</p>
                </div>
              </div>
            </button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground/40 text-center pb-4">
          Spaced repetition keeps knowledge in long-term memory.
        </p>
      </div>
    </div>
  );
}