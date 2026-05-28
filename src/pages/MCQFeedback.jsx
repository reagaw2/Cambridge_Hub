import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { saveMCQAttempt, resetGuessReviewBankLock } from "@/lib/topicStore";
import PulseFeedback from "@/components/PulseFeedback";

const OPTION_KEYS = ["A", "B", "C", "D"];

function ResultBanner({ correct, isGuess }) {
  if (correct && !isGuess) {
    return (
      <div className="w-full bg-primary/15 border border-primary/40 rounded-xl p-4 flex items-center gap-4">
        <CheckCircle2 className="w-7 h-7 text-primary shrink-0" />
        <p className="text-lg font-bold text-primary">Correct</p>
      </div>
    );
  }
  if (correct && isGuess) {
    return (
      <div className="w-full bg-amber-400/15 border border-amber-400/40 rounded-xl p-4 space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          <p className="text-base font-bold text-amber-400">Correct — but flagged as a guess</p>
        </div>
        <p className="text-xs text-amber-400/70 pl-9">Getting it right matters. Knowing why matters more.</p>
      </div>
    );
  }
  if (!correct && isGuess) {
    return (
      <div className="w-full bg-red-400/15 border border-red-400/40 rounded-xl p-4 flex items-center gap-4">
        <span className="text-2xl">🎲</span>
        <p className="text-base font-bold text-red-400">Incorrect — and flagged as a guess</p>
      </div>
    );
  }
  return (
    <div className="w-full bg-red-400/15 border border-red-400/40 rounded-xl p-4 flex items-center gap-4">
      <XCircle className="w-7 h-7 text-red-400 shrink-0" />
      <p className="text-lg font-bold text-red-400">Incorrect</p>
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

  useEffect(() => {
    if (!feedback || !attemptData || !question) return;
    sessionStorage.setItem("review_gate_attempt", "1");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback || !attemptData || !question) {
    navigate("/");
    return null;
  }

  async function handleNext() {
    if (guessReviewMode) {
      if (flagged_as_guess || !correct) await resetGuessReviewBankLock(attemptData.question_id);
      navigate("/guess-review-bank");
    } else {
      navigate("/mcq", { state: { topic, sessionIndex: nextSessionIndex ?? 1 } });
    }
  }

  // Build PulseFeedback-compatible object — passes all 6 step fields through
  const pulseFeedback = {
    marks_earned: correct ? 1 : 0,
    // Standard mark breakdown
    mark_1: {
      earned: !!correct,
      keyword: feedback.step6_takeaway ?? question.options[correct_option],
      found: !!correct,
      feedback: feedback.step1_system ?? feedback.cambridge_insight ?? "",
    },
    cambridge_insight: feedback.cambridge_insight ?? feedback.step1_system ?? "",
    next_step: feedback.next_step ?? "",
    // 6-step protocol fields
    step1_system: feedback.step1_system ?? "",
    step2_phrase_breakdown: feedback.step2_phrase_breakdown ?? "",
    step3_tipping_point: feedback.step3_tipping_point ?? "",
    step4_math_visual: feedback.step4_math_visual ?? "",
    step5_edge_case: feedback.step5_edge_case ?? "",
    step6_takeaway: feedback.step6_takeaway ?? "",
    // Pulse layers
    pulse_layer_1: feedback.pulse_layer_1 ?? feedback.step6_takeaway ?? "",
    pulse_layer_2_marks: feedback.pulse_layer_2_marks ?? [],
    pulse_layer_3: feedback.pulse_layer_3 ?? [feedback.step4_math_visual, feedback.step5_edge_case].filter(Boolean).join("\n\n") ?? "",
  };

  // Add reasoning as a second mark point if student reasoned
  if (!flagged_as_guess && attemptData.reasoning && feedback.reasoning_assessment) {
    pulseFeedback.mark_2 = {
      earned: feedback.reasoning_sound === true,
      keyword: "Correct reasoning / physics logic",
      found: feedback.reasoning_sound === true,
      feedback: feedback.reasoning_assessment,
    };
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{question.source}</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          <ResultBanner correct={correct} isGuess={flagged_as_guess} />

          {/* Options recap */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Options</p>
            {OPTION_KEYS.map(key => {
              const isCorrectOption = key === correct_option;
              const isWrongChosen = key === chosen_option && !correct && !isCorrectOption;
              return (
                <div key={key} className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                  isCorrectOption ? "border-l-4 border-green-500/70 bg-green-500/8"
                  : isWrongChosen ? "border-l-4 border-red-400/70 bg-red-500/8"
                  : "border-border/40 bg-secondary/30"
                }`}>
                  <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${
                    isCorrectOption ? "text-green-400" : isWrongChosen ? "text-red-400" : "text-muted-foreground"
                  }`}>{key}</span>
                  <span className="text-xs text-foreground/80 leading-relaxed">{question.options[key]}</span>
                  {isCorrectOption && <span className="ml-auto text-[10px] text-green-400 font-bold shrink-0">✓ correct</span>}
                  {isWrongChosen && <span className="ml-auto text-[10px] text-red-400 font-bold shrink-0">✗ chosen</span>}
                </div>
              );
            })}
          </div>

          {/* 3-layer PulseFeedback with all 6 steps embedded */}
          <PulseFeedback
            feedback={pulseFeedback}
            subject="physics"
            marksTotal={1}
            questionId={question.id}
            questionText={question.text}
            studentAnswer={
              flagged_as_guess
                ? `Guessed: ${chosen_option}`
                : `Chose ${chosen_option}. Reasoning: ${attemptData.reasoning ?? ""}`
            }
          />

          <button onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
            Next question →
          </button>

          <button onClick={() => navigate("/physics")}
            className="w-full bg-transparent border border-border text-muted-foreground font-medium text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
            Switch to written
          </button>

        </div>
      </div>
    </div>
  );
}