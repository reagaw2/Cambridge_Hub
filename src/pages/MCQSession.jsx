import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { getQuestionsForTopic, getQuestionsByIds } from "@/lib/mcqBank";
import { recordAttempt } from "@/lib/topicStore";
import { base44 } from "@/api/base44Client";

const OPTION_KEYS = ["A", "B", "C", "D"];

// ── Option row with cross-out ─────────────────────────────────────────────────
function OptionRow({ optKey, text, selected, crossedOut, onSelect, onToggleCrossOut }) {
  const isSelected = selected === optKey;

  return (
    <div className={`group relative w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
      crossedOut
        ? "border-border/30 bg-secondary/20 opacity-50"
        : isSelected
          ? "border-l-4 border-amber-400 bg-amber-400/8"
          : "border-border hover:border-border/80"
    }`}>
      {/* Select area */}
      <button
        type="button"
        onClick={() => !crossedOut && onSelect(optKey)}
        className="flex items-start gap-3 flex-1 min-w-0 text-left"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        <span className={`font-mono text-xs font-bold mt-0.5 shrink-0 w-4 transition-colors ${
          isSelected ? "text-amber-400"
          : crossedOut ? "text-muted-foreground/30"
          : "text-muted-foreground"
        }`}>{optKey}</span>
        <span className={`text-sm leading-relaxed flex-1 min-w-0 transition-all ${
          crossedOut ? "line-through text-muted-foreground/30" : "text-foreground/90"
        }`}>{text}</span>
      </button>

      {/* Cross-out toggle button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onToggleCrossOut(optKey); }}
        title={crossedOut ? "Restore option" : "Cross out this option"}
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ml-1 mt-0.5 ${
          crossedOut
            ? "bg-red-500/25 border border-red-500/50 text-red-400 opacity-100"
            : "opacity-0 group-hover:opacity-100 bg-secondary border border-border text-muted-foreground/50 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400"
        }`}
      >
        <X className="w-3 h-3" />
      </button>

      {/* Cross-out line overlay */}
      {crossedOut && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-3 right-3 h-px bg-muted-foreground/30" />
        </div>
      )}
    </div>
  );
}

export default function MCQSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const topic = state?.topic;
  const guessReviewMode = state?.guessReviewMode ?? false;
  const guessReviewBank = state?.guessReviewBank ?? [];
  const sessionIndex = state?.sessionIndex ?? 0;

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [crossedOut, setCrossedOut] = useState(new Set());
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

  function handleToggleCrossOut(key) {
    setCrossedOut(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Deselect if this option was selected
        if (selected === key) setSelected(null);
      }
      return next;
    });
  }

  const reasoningValid = isGuess || reasoning.trim().length > 0;
  const crossedCount = crossedOut.size;

  async function handleSubmit() {
    if (!selected) { setNoSelectionError(true); return; }
    if (!reasoningValid) { setNoReasoningError(true); return; }

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

    const optionsBlock = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");

    const prompt = `Cambridge A Level Physics MCQ examiner. Mark this attempt and provide feedback.

Q: ${question.text}
Options: ${optionsBlock}
Correct: ${question.correct} (${question.options[question.correct]})
Chosen: ${selected} (${question.options[selected]}) — ${isCorrect ? "CORRECT" : "WRONG"}
${isGuess ? "Flagged as guess." : `Reasoning: "${attemptData.reasoning ?? "none"}"`}

JSON response (be concise, 1-2 sentences per field):
{
  "step1_system": "what concept is tested",
  "step2_phrase_breakdown": "hidden meaning in key words",
  "step3_tipping_point": "the logical boundary that determines the answer",
  "step4_math_visual": "key calculation or diagram",
  "step5_edge_case": "what if you flipped the main variable",
  "step6_takeaway": "reusable rule, max 15 words",
  "pulse_layer_1": "same as step6_takeaway",
  "pulse_layer_2_marks": [{"notation":"Key Point","description":"what was needed","earned":${isCorrect},"examiner_note":"one sentence"}],
  "pulse_layer_3": "one sentence combining steps 4 and 5",
  "cambridge_insight": "why this trips students up",
  "next_step": "what to review",
  "reasoning_assessment": "${isGuess ? "Guess — no reasoning." : "assess the reasoning in one sentence"}",
  "reasoning_sound": ${isGuess ? "null" : "true or false"}
}`;

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          step1_system: { type: "string" },
          step2_phrase_breakdown: { type: "string" },
          step3_tipping_point: { type: "string" },
          step4_math_visual: { type: "string" },
          step5_edge_case: { type: "string" },
          step6_takeaway: { type: "string" },
          pulse_layer_1: { type: "string" },
          pulse_layer_2_marks: { type: "array", items: { type: "object" } },
          pulse_layer_3: { type: "string" },
          cambridge_insight: { type: "string" },
          next_step: { type: "string" },
          reasoning_assessment: { type: "string" },
          reasoning_sound: { type: "boolean" },
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

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{question.source}</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-900 bg-amber-400/80 px-3 py-1 rounded-full">
              Multiple Choice
            </span>
          </div>

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

          {/* Elimination hint */}
          <p className="text-[11px] text-muted-foreground/50 text-center -mt-1">
            Hover an option and tap <span className="font-mono bg-secondary px-1 rounded">✕</span> to cross it out
            {crossedCount > 0 && <span className="text-red-400/70 ml-1">· {crossedCount} crossed out</span>}
          </p>

          <div className="flex flex-col gap-2.5">
            {OPTION_KEYS.map(key => (
              <OptionRow
                key={key}
                optKey={key}
                text={question.options[key]}
                selected={selected}
                crossedOut={crossedOut.has(key)}
                onSelect={handleSelect}
                onToggleCrossOut={handleToggleCrossOut}
              />
            ))}
          </div>

          {noSelectionError && <p className="text-sm text-red-400/80 text-center -mt-1">Select an answer first</p>}

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Why did you choose this?</p>
            {isGuess ? (
              <p className="text-xs text-muted-foreground/50 italic py-2">Flagged as a guess — no reasoning required</p>
            ) : (
              <textarea
                value={reasoning}
                onChange={e => { setReasoning(e.target.value); if (noReasoningError) setNoReasoningError(false); }}
                placeholder="Brief reason — one or two sentences is enough"
                rows={3}
                className="w-full bg-card border border-border rounded-xl p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            )}
          </div>

          {noReasoningError && <p className="text-sm text-amber-400/90 text-center -mt-1">Please explain your reasoning or tap Just a guess</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsGuess(g => !g); if (noReasoningError) setNoReasoningError(false); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isGuess ? "bg-amber-400 text-amber-900" : "bg-secondary text-secondary-foreground hover:brightness-110"
              }`}
            >
              🎲 Just a guess
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-xl transition-all ${
                reasoningValid && !loading ? "hover:brightness-110 active:scale-[0.98]" : "opacity-50 cursor-not-allowed"
              } disabled:opacity-40`}
            >
              {loading ? "Analysing..." : "Submit Answer"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}