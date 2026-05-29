import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, Calculator, Grid3X3, ChevronDown, Zap, Microscope } from "lucide-react";
import { PHYSICS_P1_QUESTIONS, PAPER_META, FORMULA_SHEET_URL } from "@/lib/physicsP1Bank";
import { base44 } from "@/api/base44Client";
import ScientificCalculator from "@/components/ScientificCalculator";
import { saveMCQAttempt } from "@/lib/topicStore";

const OPTION_KEYS = ["A", "B", "C", "D"];

// ── Layer 1 feedback — fast, minimal ─────────────────────────────────────────
function Layer1Feedback({ feedback, isCorrect, isGuess }) {
  const accent = isCorrect && !isGuess ? "text-green-400" : isGuess ? "text-amber-400" : "text-red-400";
  const accentBg = isCorrect && !isGuess ? "bg-green-500/10 border-green-500/25" : isGuess ? "bg-amber-500/10 border-amber-500/25" : "bg-red-500/10 border-red-500/25";

  return (
    <div className="space-y-3">
      {/* Score banner */}
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${accentBg}`}>
        <span className="text-2xl shrink-0">
          {isCorrect && !isGuess ? "✅" : isGuess ? "🎲" : "❌"}
        </span>
        <div>
          <p className={`text-sm font-bold ${accent}`}>
            {isCorrect && !isGuess ? "Correct!" : isGuess && isCorrect ? "Correct — but flagged as a guess" : isGuess ? "Incorrect — flagged as a guess" : "Incorrect"}
          </p>
          {(isGuess || !isCorrect) && (
            <p className="text-[11px] text-muted-foreground mt-0.5">Added to your review bank</p>
          )}
        </div>
      </div>

      {/* Takeaway (Layer 1) */}
      {feedback.pulse_layer_1 && (
        <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 overflow-hidden">
          <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/70">📌 The Exam Takeaway</p>
          </div>
          <p className="text-sm font-bold text-white leading-snug">{feedback.pulse_layer_1}</p>
        </div>
      )}

      {/* Cambridge insight */}
      {feedback.cambridge_insight && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
        </div>
      )}
    </div>
  );
}

// ── Layer 2 feedback — on demand ─────────────────────────────────────────────
function Layer2Feedback({ feedback }) {
  const steps = [
    { number: "1", color: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" }, label: "The System & Objective", content: feedback.step1_system },
    { number: "2", color: { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400" }, label: "Phrase-by-Phrase Breakdown", content: feedback.step2_phrase_breakdown },
    { number: "3", color: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400" }, label: "The Tipping Point", content: feedback.step3_tipping_point },
  ];

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <Microscope className="w-3 h-3 text-white/40" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Layer 2 · Steps 1–3</p>
          <p className="text-xs font-bold text-white">System · Breakdown · Tipping Point</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-4">
        {steps.map(s => s.content ? (
          <div key={s.number} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-md ${s.color.bg} border ${s.color.border} flex items-center justify-center shrink-0`}>
                <span className={`text-[9px] font-black ${s.color.text}`}>{s.number}</span>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.color.text} opacity-70`}>{s.label}</p>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed pl-7">{s.content}</p>
          </div>
        ) : null)}
      </div>
    </div>
  );
}

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
          <img src={FORMULA_SHEET_URL} alt="Formula sheet" className="w-full rounded-lg" style={{ background: "#fff" }} />
        </div>
      </div>
    </div>
  );
}

// ── Overview panel ───────────────────────────────────────────────────────────
function OverviewPanel({ questions, answers, currentIdx, onJump, onClose }) {
  const topics = [...new Set(questions.map(q => q.topic))];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">Question Overview</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {Object.keys(answers).length} of {questions.length} answered
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground pb-1 border-b border-border/40">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/60 inline-block border border-green-500/40" />Correct</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/60 inline-block border border-red-500/40" />Incorrect</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/60 inline-block border border-amber-500/40" />Guessed</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary inline-block border border-border" />Not answered</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-primary bg-primary/20 inline-block" />Current</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            const isAnswered = !!a?.chosen;
            const isCorrect = a?.correct;
            const isGuess = a?.flagged_as_guess;
            return (
              <button key={q.id} onClick={() => { onJump(i); onClose(); }} title={`Q${q.number}: ${q.topic}`}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                  isCurrent ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                  : isGuess ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : isAnswered && isCorrect ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : isAnswered && !isCorrect ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                }`}>
                {q.number}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 pt-1 border-t border-border/40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By topic</p>
          {topics.map(topic => {
            const topicQs = questions.filter(q => q.topic === topic);
            const answered = topicQs.filter(q => answers[q.id]?.chosen);
            const correct = answered.filter(q => answers[q.id]?.correct).length;
            return (
              <div key={topic} className="flex items-center gap-3">
                <span className="text-xs text-foreground/70 flex-1 truncate">{topic}</span>
                <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                  {answered.length}/{topicQs.length}
                  {answered.length > 0 && (
                    <span className={` ml-1 ${correct === answered.length ? "text-green-400" : "text-amber-400"}`}>
                      ({correct} ✓)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main session ─────────────────────────────────────────────────────────────
export default function P1Session() {
  const navigate = useNavigate();
  const questions = PHYSICS_P1_QUESTIONS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [isGuess, setIsGuess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingL2, setLoadingL2] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [layer1, setLayer1] = useState(null);  // fast feedback
  const [layer2, setLayer2] = useState(null);  // on-demand breakdown

  const question = questions[currentIdx];
  const existingAnswer = answers[question?.id];

  useEffect(() => {
    setSelected(existingAnswer?.chosen ?? null);
    setIsGuess(existingAnswer?.flagged_as_guess ?? false);
    setSubmitted(!!existingAnswer);
    setLayer1(existingAnswer?.layer1 ?? null);
    setLayer2(existingAnswer?.layer2 ?? null);
    setShowCalc(false);
  }, [currentIdx]);

  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount / questions.length;

  async function handleSubmit() {
    if (!selected || loading || submitted) return;
    setLoading(true);

    const isCorrect = selected === question.correct;

    // Save to review bank
    await saveMCQAttempt({
      question_id: question.id,
      topic: question.topic,
      source: "9702/12/F/M/25",
      chosen_option: selected,
      correct_option: question.correct,
      correct: isCorrect,
      flagged_as_guess: isGuess,
      reasoning: isGuess ? null : selected,
    });

    // ── Layer 1 only — fast, minimal prompt ──────────────────────────────
    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const l1prompt = `Cambridge A Level Physics MCQ. Q${question.number}: ${question.text}
Options: ${optionsList}
Correct: ${question.correct} (${question.options[question.correct]})
Student chose: ${selected} — ${isCorrect ? "CORRECT" : "WRONG"}
${isGuess ? "Student flagged this as a guess." : ""}

Respond ONLY in JSON:
{
  "marks_earned": ${isCorrect ? 1 : 0},
  "cambridge_insight": "One sentence: why ${question.correct} is the right answer.",
  "pulse_layer_1": "The reusable exam rule. Max 12 words."
}`;

    let fb1 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({
        prompt: l1prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            marks_earned: { type: "number" },
            cambridge_insight: { type: "string" },
            pulse_layer_1: { type: "string" },
          },
          required: ["marks_earned", "cambridge_insight", "pulse_layer_1"],
        },
      });
      fb1 = r?.response ?? r;
    } catch {
      fb1 = {
        marks_earned: isCorrect ? 1 : 0,
        cambridge_insight: question.explanation,
        pulse_layer_1: question.explanation,
      };
    }

    const answerRecord = { chosen: selected, correct: isCorrect, flagged_as_guess: isGuess, layer1: fb1, layer2: null };
    setAnswers(prev => ({ ...prev, [question.id]: answerRecord }));
    setLayer1(fb1);
    setLayer2(null);
    setSubmitted(true);
    setLoading(false);
  }

  async function handleRequestLayer2() {
    if (loadingL2 || layer2) return;
    setLoadingL2(true);

    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const l2prompt = `Cambridge A Level Physics MCQ. Q${question.number}: ${question.text}
Options: ${optionsList}
Correct: ${question.correct} (${question.options[question.correct]})
Student chose: ${selected} — ${existingAnswer?.correct ? "CORRECT" : "WRONG"}

Give a deeper breakdown. Respond ONLY in JSON:
{
  "step1_system": "One sentence: what fundamental concept or law this question tests.",
  "step2_phrase_breakdown": "One to two sentences: which specific words or quantities in the question determine the answer.",
  "step3_tipping_point": "One sentence: the exact logical step that separates ${question.correct} from the most tempting wrong option."
}`;

    let fb2 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({
        prompt: l2prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            step1_system: { type: "string" },
            step2_phrase_breakdown: { type: "string" },
            step3_tipping_point: { type: "string" },
          },
          required: ["step1_system", "step2_phrase_breakdown", "step3_tipping_point"],
        },
      });
      fb2 = r?.response ?? r;
    } catch {
      fb2 = {
        step1_system: "Could not load breakdown.",
        step2_phrase_breakdown: "",
        step3_tipping_point: "",
      };
    }

    setLayer2(fb2);
    setAnswers(prev => ({
      ...prev,
      [question.id]: { ...prev[question.id], layer2: fb2 },
    }));
    setLoadingL2(false);
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
    else navigate("/physics/p1-summary", { state: { answers, questions, paperId: PAPER_META.id } });
  }

  function handlePrev() {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }

  if (!question) return null;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === questions.length - 1;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* ── Sticky top bar ── */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>

            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-foreground">9702/12 · F/M/25</p>
              <p className="text-[10px] text-muted-foreground">Q{currentIdx + 1} of {questions.length}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowCalc(c => !c)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  showCalc ? "bg-primary/20 border-primary/50 text-primary" : "bg-secondary border-border text-muted-foreground hover:brightness-110"
                }`}>
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calc</span>
              </button>
              <button onClick={() => setShowFormulas(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:brightness-110 transition-all">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Data</span>
              </button>
              <button onClick={() => setShowOverview(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:brightness-110 transition-all">
                <Grid3X3 className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px]">{answeredCount}/{questions.length}</span>
              </button>
            </div>
          </div>

          <div className="w-full h-0.5 bg-secondary">
            <div className="h-0.5 bg-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {/* ── Compact overview strip ── */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b border-border/30 bg-card/40">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            const isAnswered = !!a?.chosen;
            return (
              <button key={q.id} onClick={() => setCurrentIdx(i)}
                className={`shrink-0 w-6 h-6 rounded-md text-[9px] font-bold border transition-all ${
                  isCurrent ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                  : a?.flagged_as_guess ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : isAnswered && a?.correct ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : isAnswered && !a?.correct ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-secondary/60 border-border/40 text-muted-foreground/50"
                }`}>
                {q.number}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                Question {question.number}
              </span>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                {question.topic}
              </span>
            </div>
            {question.image_url && (
              <div className="rounded-xl overflow-hidden border border-border/40" style={{ background: "#fff" }}>
                <img src={question.image_url} alt={`Diagram for Q${question.number}`} className="w-full object-contain" loading="lazy" />
              </div>
            )}
            <p className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-line">{question.text}</p>
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
                    : isSelected ? "text-primary" : "text-muted-foreground"
                  }`}>{key}</span>
                  <span className="text-sm leading-relaxed flex-1">{question.options[key]}</span>
                  {submitted && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
                  {submitted && isWrongChosen && <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Guess + Submit (pre-submission) */}
          {!submitted && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsGuess(g => !g)}
                className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all shrink-0 ${
                  isGuess ? "bg-amber-400 text-amber-900 border-amber-400" : "bg-secondary border-border text-muted-foreground hover:brightness-110"
                }`}>
                🎲 {isGuess ? "Guess!" : "Just a guess"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected || loading}
                className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Marking…
                  </span>
                ) : "Submit Answer"}
              </button>
            </div>
          )}

          {/* Layer 1 feedback (appears immediately after submit) */}
          {submitted && layer1 && (
            <Layer1Feedback
              feedback={layer1}
              isCorrect={existingAnswer?.correct ?? false}
              isGuess={existingAnswer?.flagged_as_guess ?? false}
            />
          )}

          {/* "Show breakdown" button — only shown after Layer 1 loads and Layer 2 not yet fetched */}
          {submitted && layer1 && !layer2 && (
            <button
              onClick={handleRequestLayer2}
              disabled={loadingL2}
              className="w-full flex items-center justify-center gap-2 border border-white/10 bg-white/[0.03] text-muted-foreground text-sm font-semibold py-3 rounded-xl hover:bg-white/[0.06] hover:text-foreground active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loadingL2 ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Loading breakdown…
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show deeper breakdown
                </>
              )}
            </button>
          )}

          {/* Layer 2 — on demand, no mark scheme verdict, no Layer 3 */}
          {layer2 && <Layer2Feedback feedback={layer2} />}

          {/* Prev / Next — always visible */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={handlePrev} disabled={isFirst}
              className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={handleNext}
              className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
              {isLast ? "Finish" : "Next"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!submitted && (
            <p className="text-[11px] text-muted-foreground/40 text-center -mt-1">
              You can skip and return later using the overview strip above
            </p>
          )}

        </div>
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