import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { saveMCQAttempt, getGuessReviewBank } from "@/lib/topicStore";

const OPTION_KEYS = ["A", "B", "C", "D"];

function ResultBanner({ correct, isGuess }) {
  if (correct && !isGuess) {
    return (
      <div className="w-full bg-primary/15 border border-primary/40 rounded-xl p-5 flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
        <p className="text-xl font-bold text-primary">Correct</p>
      </div>
    );
  }
  if (correct && isGuess) {
    return (
      <div className="w-full bg-amber-400/15 border border-amber-400/40 rounded-xl p-5 space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          <p className="text-lg font-bold text-amber-400">Correct — but flagged as a guess</p>
        </div>
        <p className="text-xs text-amber-400/70 pl-9">Getting it right matters. Knowing why matters more.</p>
      </div>
    );
  }
  if (!correct && isGuess) {
    return (
      <div className="w-full bg-red-400/15 border border-red-400/40 rounded-xl p-5 flex items-center gap-4">
        <span className="text-2xl">🎲</span>
        <p className="text-lg font-bold text-red-400">Incorrect — and flagged as a guess</p>
      </div>
    );
  }
  // incorrect, not a guess
  return (
    <div className="w-full bg-red-400/15 border border-red-400/40 rounded-xl p-5 flex items-center gap-4">
      <XCircle className="w-8 h-8 text-red-400 shrink-0" />
      <p className="text-xl font-bold text-red-400">Incorrect</p>
    </div>
  );
}

export default function MCQFeedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { feedback, attemptData, question, topic, guessReviewMode, guessReviewBank, nextSessionIndex } = state || {};

  const correct = attemptData?.correct;
  const flagged_as_guess = attemptData?.flagged_as_guess;
  const chosen_option = attemptData?.chosen_option;
  const correct_option = attemptData?.correct_option;
  const reasoning = attemptData?.reasoning;

  // Save attempt to localStorage immediately on mount — must be before any early return
  useEffect(() => {
    if (!feedback || !attemptData || !question) return;
    saveMCQAttempt({
      question_id: question.id,
      topic: question.topic,
      source: question.source,
      chosen_option: attemptData.chosen_option,
      correct_option: attemptData.correct_option,
      correct: attemptData.correct,
      flagged_as_guess: attemptData.flagged_as_guess,
      reasoning: attemptData.reasoning,
    });
  }, []);

  if (!feedback || !attemptData || !question) {
    navigate("/");
    return null;
  }

  function handleNext() {
    if (guessReviewMode) {
      const updatedBank = getGuessReviewBank();
      if (updatedBank.length === 0) {
        navigate("/");
      } else {
        navigate("/mcq", { state: { topic: null, guessReviewMode: true, guessReviewBank: updatedBank, sessionIndex: nextSessionIndex ?? 1 } });
      }
    } else {
      navigate("/mcq", { state: { topic, sessionIndex: nextSessionIndex ?? 1 } });
    }
  }

  function handleSwitchToWritten() {
    navigate("/");
  }

  // Determine reasoning border colour from Claude's assessment
  const reasoningBorder = feedback.reasoning_sound === true
    ? "border-l-green-500/70"
    : feedback.reasoning_sound === false
    ? "border-l-red-400/70"
    : "border-l-border";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {question.source}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* SECTION 1 — Result banner */}
          <ResultBanner correct={correct} isGuess={flagged_as_guess} />

          {/* SECTION 2 — Critical keyword */}
          <div className="bg-card border border-l-4 border-border border-l-amber-400 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Key word in this question
            </p>
            <span className="inline-block bg-amber-400 text-amber-900 font-bold text-base px-4 py-1.5 rounded-full">
              {feedback.critical_keyword_word}
            </span>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {feedback.critical_keyword_explanation}
            </p>
          </div>

          {/* SECTION 3 — Your reasoning (only if not a guess) */}
          {!flagged_as_guess && reasoning && (
            <div className={`bg-card border border-l-4 border-border ${reasoningBorder} rounded-xl p-5 space-y-3`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Your reasoning
              </p>
              <p className="text-sm text-muted-foreground italic leading-relaxed">"{reasoning}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {feedback.reasoning_assessment}
              </p>
            </div>
          )}

          {/* SECTION 4 — Answer explanation */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Why option {correct_option} is correct
            </p>
            <div className="flex flex-col gap-2">
              {OPTION_KEYS.map((key) => {
                const isCorrectOption = key === correct_option;
                const isChosen = key === chosen_option;
                const isWrongChosen = isChosen && !correct && !isCorrectOption;

                let borderClass = "border-border";
                let labelClass = "text-muted-foreground";
                if (isCorrectOption) { borderClass = "border-l-4 border-green-500/70"; labelClass = "text-green-500"; }
                if (isWrongChosen) { borderClass = "border-l-4 border-red-400/70"; labelClass = "text-red-400"; }
                // If student was correct their chosen IS the correct option — already green above

                return (
                  <div
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-lg border bg-secondary/30 ${borderClass}`}
                  >
                    <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${labelClass}`}>{key}</span>
                    <span className="text-xs text-foreground/80 leading-relaxed">{question.options[key]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed pt-1">
              {feedback.answer_explanation}
            </p>
          </div>

          {/* SECTION 5 — Next step */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Next Step</p>
            <p className="text-sm text-primary leading-relaxed font-medium">{feedback.next_step}</p>
          </div>

          {/* SECTION 6 — Buttons */}
          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Next question →
          </button>
          <button
            onClick={handleSwitchToWritten}
            className="w-full bg-transparent border border-border text-muted-foreground font-medium text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Switch to written
          </button>

        </div>
      </div>
    </div>
  );
}