import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { getQuestionsForTopic, advanceMCQIndex } from "@/lib/mcqBank";
import { recordAttempt } from "@/lib/topicStore";

const OPTION_KEYS = ["A", "B", "C", "D"];

function OptionButton({ letter, text, selected, revealed, correct, onSelect }) {
  let ring = "border-border";
  if (revealed) {
    if (letter === correct) ring = "border-primary bg-primary/10";
    else if (letter === selected && letter !== correct) ring = "border-red-400/70 bg-red-400/10";
  } else if (selected === letter) {
    ring = "border-primary/60 bg-primary/8";
  }

  return (
    <button
      onClick={() => !revealed && onSelect(letter)}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border ${ring} transition-all text-left min-h-[56px]`}
    >
      <span className="font-mono text-xs font-bold text-muted-foreground mt-0.5 shrink-0 w-4">{letter}</span>
      <span className="text-sm text-foreground/90 leading-relaxed flex-1">{text}</span>
      {revealed && letter === correct && (
        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      )}
      {revealed && letter === selected && letter !== correct && (
        <XCircle className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" />
      )}
    </button>
  );
}

export default function MCQSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const topic = state?.topic;

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!topic) { navigate("/"); return; }
    setQuestions(getQuestionsForTopic(topic));
  }, [topic]);

  if (!topic || questions.length === 0) return null;

  const question = questions[idx % questions.length];

  function handleSelect(letter) {
    setSelected(letter);
  }

  function handleConfirm() {
    if (!selected) return;
    setRevealed(true);
    const correct = selected === question.correct;
    if (correct) setScore((s) => s + 1);
    setTotal((t) => t + 1);
  }

  function handleNext() {
    // Advance the stored index so next session continues from here
    advanceMCQIndex(topic);
    // Record attempt in topic store (1 = correct, 0 = wrong)
    recordAttempt(topic, selected === question.correct ? 1 : 0);
    setSelected(null);
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  const isCorrect = revealed && selected === question.correct;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Multiple Choice</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {score}/{total} correct
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Topic pill */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {topic}
            </span>
            {/* Source tag */}
            <span className="text-[10px] text-muted-foreground/50 bg-secondary/50 px-2 py-0.5 rounded-full font-mono">
              {question.source}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                {question.id}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Q{(idx % questions.length) + 1} of {questions.length}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-foreground/90">{question.text}</p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {OPTION_KEYS.map((key) => (
              <OptionButton
                key={key}
                letter={key}
                text={question.options[key]}
                selected={selected}
                revealed={revealed}
                correct={question.correct}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Confirm / Next */}
          {!revealed ? (
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Answer
            </button>
          ) : (
            <div className="space-y-3">
              {/* Result banner */}
              <div className={`rounded-xl p-4 border ${isCorrect ? "bg-primary/10 border-primary/30" : "bg-red-400/10 border-red-400/30"}`}>
                <p className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-red-400"}`}>
                  {isCorrect ? "Correct!" : `Incorrect — the correct answer is ${question.correct}`}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-foreground/70 mt-1">{question.options[question.correct]}</p>
                )}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Next Question <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}