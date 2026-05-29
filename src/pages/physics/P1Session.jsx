import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, ImageOff } from "lucide-react";
import { PHYSICS_P1_QUESTIONS, PAPER_META, FORMULA_SHEET_URL } from "@/lib/physicsP1Bank";
import { base44 } from "@/api/base44Client";
import PulseFeedback from "@/components/PulseFeedback";

const OPTION_KEYS = ["A", "B", "C", "D"];

// ── Formula sheet modal ──────────────────────────────────────────────────────
function FormulaSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-[700px] bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 sticky top-0 bg-card z-10">
          <p className="font-bold text-foreground">Formula Sheet — 9702/12/F/M/25</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-2">
          <img
            src={FORMULA_SHEET_URL}
            alt="Formula sheet"
            className="w-full rounded-lg"
            style={{ background: "#fff" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Question overview panel ──────────────────────────────────────────────────
function OverviewPanel({ questions, answers, currentIdx, onJump, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-[480px] bg-card border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="font-bold text-foreground">Question Overview</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            const isLocked = q.image_required;
            const isAnswered = !!a?.chosen;
            const isCorrect = a?.correct;
            return (
              <button
                key={q.id}
                onClick={() => { onJump(i); onClose(); }}
                title={isLocked ? "Image needed — coming soon" : `Q${q.number}: ${q.topic}`}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                  isCurrent
                    ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                    : isLocked
                      ? "bg-secondary/40 border-border/30 text-muted-foreground/30 cursor-default"
                      : isAnswered
                        ? isCorrect
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {isLocked ? "🔒" : q.number}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500/60 inline-block" />Correct</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/60 inline-block" />Incorrect</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-secondary inline-block border border-border" />Unanswered</span>
          <span className="flex items-center gap-1"><span className="text-[10px]">🔒</span> Image needed</span>
        </div>
      </div>
    </div>
  );
}

// ── Locked question placeholder ──────────────────────────────────────────────
function LockedQuestion({ question }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary/60 border border-border/50 flex items-center justify-center">
        <ImageOff className="w-7 h-7 text-muted-foreground/40" />
      </div>
      <div className="space-y-2">
        <p className="text-base font-bold text-foreground/50">Image Required</p>
        <p className="text-sm text-muted-foreground/50 max-w-xs leading-relaxed">
          Question {question.number} contains a diagram that hasn't been added yet. It will be available soon.
        </p>
      </div>
      <div className="bg-card border border-border/40 rounded-xl p-4 max-w-sm text-left space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Topic</p>
        <p className="text-sm text-foreground/50">{question.topic}</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 pt-1">Question</p>
        <p className="text-sm text-foreground/50 leading-relaxed">{question.text}</p>
      </div>
    </div>
  );
}

// ── Main session ─────────────────────────────────────────────────────────────
export default function P1Session() {
  const navigate = useNavigate();
  const questions = PHYSICS_P1_QUESTIONS;

  const [currentIdx, setCurrentIdx] = useState(() => {
    // Skip to first available (non-locked) question
    return 0;
  });
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const question = questions[currentIdx];
  const existingAnswer = answers[question?.id];
  const isLocked = question?.image_required ?? false;

  // Restore state when navigating between questions
  useEffect(() => {
    setSelected(existingAnswer?.chosen ?? null);
    setSubmitted(!!existingAnswer);
    setFeedbackData(existingAnswer?.feedbackData ?? null);
  }, [currentIdx]);

  const answeredCount = Object.values(answers).filter(a => a.chosen).length;
  const availableCount = questions.filter(q => !q.image_required).length;
  const lockedCount = questions.filter(q => q.image_required).length;

  async function handleSubmit() {
    if (!selected || loading || submitted || isLocked) return;
    setLoading(true);

    const isCorrect = selected === question.correct;

    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");

    const prompt = `You are an expert Cambridge A Level Physics (9702) examiner marking Paper 1 (9702/12/F/M/25).

Question ${question.number} [${question.topic}]: ${question.text}

Options:
${optionsList}

Correct answer: ${question.correct}
Correct answer text: ${question.options[question.correct]}
Student's answer: ${selected}
Student's answer text: ${question.options[selected]}
Result: ${isCorrect ? "CORRECT" : "INCORRECT"}

${!isCorrect ? `The student chose ${selected} but the correct answer is ${question.correct}. Explain clearly why ${question.correct} is right and why ${selected} is wrong.` : `Confirm why ${question.correct} is the correct answer.`}

Respond in this exact JSON format only:
{
  "marks_earned": ${isCorrect ? 1 : 0},
  "cambridge_insight": "Two sentences: what concept is being tested and why the correct answer is right.",
  "next_step": "One sentence: what the student should revise.",
  "step1_system": "The fundamental physics concept or law this question tests.",
  "step2_phrase_breakdown": "The key words or quantities in the question stem that determine which option is correct.",
  "step3_tipping_point": "The single logical step that separates ${question.correct} from the most tempting wrong answer.",
  "step4_math_visual": "Show the key calculation or reasoning that proves ${question.correct} is correct.",
  "step5_edge_case": "How would the answer change if one key variable were different?",
  "step6_takeaway": "The reusable exam rule. Max 15 words.",
  "pulse_layer_1": "Same as step6_takeaway.",
  "pulse_layer_2_marks": [{"notation": "Key Point", "description": "${question.explanation}", "earned": ${isCorrect}, "examiner_note": "${isCorrect ? "Correct." : "Incorrect — see explanation."}"}],
  "pulse_layer_3": "One sentence combining the calculation proof and the edge case."
}`;

    let fb = null;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            marks_earned: { type: "number" },
            cambridge_insight: { type: "string" },
            next_step: { type: "string" },
            step1_system: { type: "string" },
            step2_phrase_breakdown: { type: "string" },
            step3_tipping_point: { type: "string" },
            step4_math_visual: { type: "string" },
            step5_edge_case: { type: "string" },
            step6_takeaway: { type: "string" },
            pulse_layer_1: { type: "string" },
            pulse_layer_2_marks: { type: "array", items: { type: "object" } },
            pulse_layer_3: { type: "string" },
          },
        },
      });
      fb = result?.response ?? result;
    } catch {
      fb = {
        marks_earned: isCorrect ? 1 : 0,
        cambridge_insight: question.explanation,
        next_step: "Review this topic in your notes.",
        pulse_layer_1: question.explanation,
        pulse_layer_2_marks: [{ notation: "Key Point", description: question.explanation, earned: isCorrect, examiner_note: "" }],
      };
    }

    setAnswers(prev => ({ ...prev, [question.id]: { chosen: selected, correct: isCorrect, feedbackData: fb } }));
    setFeedbackData(fb);
    setSubmitted(true);
    setLoading(false);
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      navigate("/physics/p1-summary", {
        state: { answers, questions, paperId: PAPER_META.id },
      });
    }
  }

  function handlePrev() {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }

  if (!question) return null;

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === questions.length - 1;
  const progress = answeredCount / availableCount;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5">
            <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>

            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-foreground">9702/12 · F/M/25</p>
              <p className="text-[10px] text-muted-foreground">
                Q{currentIdx + 1} of {questions.length}
                {lockedCount > 0 && <span className="text-muted-foreground/50"> · {lockedCount} locked</span>}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFormulas(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:brightness-110 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Formulas
              </button>
              <button
                onClick={() => setShowOverview(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:brightness-110 transition-all"
              >
                <span className="font-mono text-[10px]">{answeredCount}/{availableCount}</span>
              </button>
            </div>
          </div>

          {/* Progress bar — only counts available questions */}
          <div className="w-full h-0.5 bg-secondary">
            <div
              className="h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
            />
          </div>
        </div>

        {/* Locked question state */}
        {isLocked ? (
          <div className="flex-1 flex flex-col">
            <LockedQuestion question={question} />
            <div className="px-4 pb-8">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handlePrev} disabled={isFirst}
                  className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button onClick={handleNext}
                  className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
                  {isLast ? "See Results" : "Next"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal question */
          <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

            {/* Question header card */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                  Question {question.number}
                </span>
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  {question.topic}
                </span>
              </div>
              <p className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-line">
                {question.text}
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {OPTION_KEYS.map(key => {
                const isSelected = selected === key;
                const isCorrectOption = key === question.correct;
                const isWrongChosen = submitted && key === selected && !isCorrectOption;

                let cls = "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ";
                if (submitted) {
                  if (isCorrectOption) cls += "border-l-4 border-green-500 bg-green-500/10";
                  else if (isWrongChosen) cls += "border-l-4 border-red-400 bg-red-500/10";
                  else cls += "border-border/40 bg-secondary/30 opacity-40";
                } else {
                  cls += isSelected
                    ? "border-l-4 border-primary bg-primary/10 cursor-pointer"
                    : "border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
                }

                return (
                  <button key={key} onClick={() => !submitted && setSelected(key)} disabled={submitted} className={cls}>
                    <span className={`font-mono text-xs font-black shrink-0 mt-0.5 w-4 ${
                      submitted && isCorrectOption ? "text-green-400"
                      : submitted && isWrongChosen ? "text-red-400"
                      : isSelected ? "text-primary"
                      : "text-muted-foreground"
                    }`}>
                      {key}
                    </span>
                    <span className="text-sm leading-relaxed flex-1">{question.options[key]}</span>
                    {submitted && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
                    {submitted && isWrongChosen && <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={!selected || loading}
                className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Marking…
                  </span>
                ) : "Submit Answer"}
              </button>
            )}

            {/* Feedback */}
            {submitted && feedbackData && (
              <PulseFeedback
                feedback={feedbackData}
                subject="physics"
                marksTotal={1}
                questionId={question.id}
                questionText={question.text}
                studentAnswer={`${selected}: ${question.options[selected]}`}
              />
            )}

            {/* Navigation */}
            {submitted && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handlePrev} disabled={isFirst}
                  className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button onClick={handleNext}
                  className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
                  {isLast ? "See Results" : "Next"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Skip */}
            {!submitted && (
              <button onClick={handleNext} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors text-center py-1">
                Skip this question →
              </button>
            )}

          </div>
        )}
      </div>

      {showFormulas && <FormulaSheet onClose={() => setShowFormulas(false)} />}
      {showOverview && (
        <OverviewPanel
          questions={questions}
          answers={answers}
          currentIdx={currentIdx}
          onJump={setCurrentIdx}
          onClose={() => setShowOverview(false)}
        />
      )}
    </div>
  );
}