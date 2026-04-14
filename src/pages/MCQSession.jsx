import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getQuestionsForTopic, getQuestionsByIds } from "@/lib/mcqBank";
import { recordAttempt } from "@/lib/topicStore";
import { base44 } from "@/api/base44Client";

const OPTION_KEYS = ["A", "B", "C", "D"];

function OptionButton({ letter, text, selected, onSelect }) {
  const isSelected = selected === letter;
  return (
    <button
      onClick={() => onSelect(letter)}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left min-h-[56px] ${
        isSelected
          ? "border-l-4 border-amber-400 bg-amber-400/8"
          : "border-border hover:border-border/80"
      }`}
    >
      <span
        className={`font-mono text-xs font-bold mt-0.5 shrink-0 w-4 transition-colors ${
          isSelected ? "text-amber-400" : "text-muted-foreground"
        }`}
      >
        {letter}
      </span>
      <span className="text-sm text-foreground/90 leading-relaxed flex-1">{text}</span>
    </button>
  );
}

export default function MCQSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const topic = state?.topic;
  const guessReviewMode = state?.guessReviewMode ?? false;
  const guessReviewBank = state?.guessReviewBank ?? [];
  // sessionIndex is the current question index passed via navigation state
  const sessionIndex = state?.sessionIndex ?? 0;

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [isGuess, setIsGuess] = useState(false);
  const [noSelectionError, setNoSelectionError] = useState(false);
  const [noReasoningError, setNoReasoningError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guessReviewMode) {
      const qs = getQuestionsByIds(guessReviewBank);
      if (qs.length === 0) { navigate("/"); return; }
      setQuestions(qs);
    } else {
      if (!topic) { navigate("/"); return; }
      setQuestions(getQuestionsForTopic(topic));
    }
  }, [topic, guessReviewMode]);

  if (questions.length === 0) return null;

  const idx = sessionIndex % questions.length;
  const question = questions[idx];

  function handleSelect(letter) {
    setSelected(letter);
    if (noSelectionError) setNoSelectionError(false);
  }

  const reasoningValid = isGuess || reasoning.trim().length > 0;

  async function handleSubmit() {
    if (!selected) {
      setNoSelectionError(true);
      return;
    }
    if (!reasoningValid) {
      setNoReasoningError(true);
      return;
    }

    const isCorrect = selected === question.correct;
    const attemptData = {
      question_id: question.id,
      topic: question.topic,
      chosen_option: selected,
      correct_option: question.correct,
      correct: isCorrect,
      flagged_as_guess: isGuess,
      reasoning: isGuess ? null : (reasoning.trim() || null),
    };

    setLoading(true);

    // Build the LLM prompt
    const chosenText = question.options[selected];
    const correctText = question.options[question.correct];
    const optionsBlock = OPTION_KEYS.map((k) => `${k}: ${question.options[k]}`).join("\n");

    const prompt = `You are a Cambridge A Level Physics examiner providing feedback on a multiple-choice question.

Question: ${question.text}

Options:
${optionsBlock}

Correct answer: ${question.correct} — ${correctText}
Student chose: ${selected} — ${chosenText}
Result: ${isCorrect ? "CORRECT" : "INCORRECT"}
${attemptData.flagged_as_guess ? "Student flagged this as a guess (no reasoning provided)." : `Student's reasoning: "${attemptData.reasoning ?? "None provided"}"`}

Respond ONLY in this JSON format, no extra text:
{
  "critical_keyword_word": "the single most important physics keyword or concept that unlocks this question (2–6 words)",
  "critical_keyword_explanation": "one to two sentences explaining why this keyword is central to answering this question correctly",
  "reasoning_assessment": "${isGuess ? "null — student flagged as a guess" : "one to two sentences assessing how close the student's reasoning was to the correct physics — be specific and honest"}",
  "reasoning_sound": ${isGuess ? "null" : "true or false — true if the reasoning demonstrates correct physics understanding, false if flawed or incomplete"},
  "answer_explanation": "two to three sentences explaining why the correct answer is right and why common wrong answers fail, using precise Cambridge language",
  "next_step": "one sentence telling the student exactly what to review or practise next"
}`;

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          critical_keyword_word: { type: "string" },
          critical_keyword_explanation: { type: "string" },
          reasoning_assessment: { type: "string" },
          reasoning_sound: { type: "boolean" },
          answer_explanation: { type: "string" },
          next_step: { type: "string" },
        },
      },
    }).catch(() => null);

    setLoading(false);

    await recordAttempt(question.topic, isCorrect ? 1 : 0, { total_marks: 1, question_id: question.id });

    navigate("/mcq-feedback", {
      state: {
        feedback: feedback?.response ?? feedback,
        attemptData,
        question,
        nextSessionIndex: sessionIndex + 1,
        totalQuestions: questions.length,
        topic: topic ?? question.topic,
        guessReviewMode,
        guessReviewBank,
      },
    });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* 1. Top bar */}
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

          {/* 2. Mode pill */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-900 bg-amber-400/80 px-3 py-1 rounded-full">
              Multiple Choice
            </span>
          </div>

          {/* 3. Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {question.topic}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Q{(idx % questions.length) + 1} of {questions.length}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-foreground/90">{question.text}</p>
          </div>

          {/* 4. Answer options */}
          <div className="flex flex-col gap-2.5">
            {OPTION_KEYS.map((key) => (
              <OptionButton
                key={key}
                letter={key}
                text={question.options[key]}
                selected={selected}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* No selection error */}
          {noSelectionError && (
            <p className="text-sm text-red-400/80 text-center -mt-1">Select an answer first</p>
          )}

          {/* 5 & 7. Reasoning section */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Why did you choose this?
            </p>
            {isGuess ? (
              <p className="text-xs text-muted-foreground/50 italic py-2">
                Flagged as a guess — no reasoning required
              </p>
            ) : (
              <textarea
                value={reasoning}
                onChange={(e) => { setReasoning(e.target.value); if (noReasoningError) setNoReasoningError(false); }}
                placeholder="Brief reason — one or two sentences is enough"
                rows={3}
                className="w-full bg-card border border-border rounded-xl p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            )}
          </div>

          {/* Reasoning validation message */}
          {noReasoningError && (
            <p className="text-sm text-amber-400/90 text-center -mt-1">Please explain your reasoning or tap Just a guess</p>
          )}

          {/* 6. Just a guess + Submit row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsGuess((g) => !g); if (noReasoningError) setNoReasoningError(false); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isGuess
                  ? "bg-amber-400 text-amber-900"
                  : "bg-secondary text-secondary-foreground hover:brightness-110"
              }`}
            >
              🎲 Just a guess
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-xl transition-all ${
                reasoningValid && !loading
                  ? "hover:brightness-110 active:scale-[0.98] opacity-100 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {loading ? "Analysing..." : "Submit Answer"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}