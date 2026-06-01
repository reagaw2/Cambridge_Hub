import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, CheckCircle2, Zap, Microscope, Loader2, Star, Check, MessageCircleQuestion, ChevronDown, ChevronUp } from "lucide-react";
import { getQuestionsForTopic, getQuestionsByIds } from "@/lib/mcqBank";
import { recordAttempt, saveMCQAttempt, resetGuessReviewBankLock } from "@/lib/topicStore";
import { base44 } from "@/api/base44Client";
import QuestionSessionHeader from "@/components/QuestionSessionHeader";
import SessionNotesPanel from "@/components/SessionNotesPanel";
import ScratchpadPanel from "@/components/ScratchpadPanel";
import ScientificCalculator from "@/components/ScientificCalculator";
import { getAllNotes, saveNote } from "@/lib/questionNotesStore";
import { isStarred as checkStarred, starQuestion, unstarQuestion, getAllStarred, saveTeacherQuestion, saveTeacherResponse } from "@/lib/writtenStarStore";
import { loadWorkings, saveWorking as saveTopicWorking } from "@/lib/p1WorkingsStore";
import { FORMULA_SHEET_URL } from "@/lib/physicsP1Bank";
import { useAuth } from "@/lib/AuthContext";

const OPTION_KEYS = ["A", "B", "C", "D"];
const SUBJECT = "physics";
const PAPER_ID = "mcq_physics";

function FormulaSheetModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-[700px] bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 sticky top-0 bg-card z-10">
          <p className="font-bold text-foreground">Data / Formula Sheet</p>
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

function CorrectBanner() {
  return (
    <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-5 flex flex-col items-center gap-2 text-center">
      <CheckCircle2 className="w-8 h-8 text-green-400" />
      <p className="text-lg font-bold text-green-400">Correct! Well done.</p>
      <p className="text-[11px] text-green-400/60">Moving to next question…</p>
    </div>
  );
}

function Layer1Feedback({ feedback, isGuess }) {
  const accentBg = isGuess ? "bg-amber-500/10 border-amber-500/25" : "bg-red-500/10 border-red-500/25";
  const accent = isGuess ? "text-amber-400" : "text-red-400";
  const label = isGuess ? "Incorrect — flagged as a guess" : "Incorrect";
  return (
    <div className="space-y-3">
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${accentBg}`}>
        <span className="text-2xl shrink-0">{isGuess ? "🎲" : "❌"}</span>
        <div>
          <p className={`text-sm font-bold ${accent}`}>{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Added to your review bank</p>
        </div>
      </div>
      {feedback?.pulse_layer_1 && (
        <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 overflow-hidden">
          <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/70">📌 The Exam Takeaway</p>
          </div>
          <p className="text-sm font-bold text-white leading-snug relative">{feedback.pulse_layer_1}</p>
        </div>
      )}
      {feedback?.cambridge_insight && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
        </div>
      )}
    </div>
  );
}

function Layer2OnDemand({ feedback, question, selectedOption, loadingL2, onLoad, layer2 }) {
  const [open, setOpen] = useState(false);

  async function handle() {
    if (loadingL2) return;
    if (layer2) { setOpen(o => !o); return; }
    await onLoad();
    setOpen(true);
  }

  const step1 = layer2?.step1_system ?? feedback?.step1_system;
  const step2 = layer2?.step2_phrase_breakdown ?? feedback?.step2_phrase_breakdown;
  const step3 = layer2?.step3_tipping_point ?? feedback?.step3_tipping_point;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
      <button
        onClick={handle}
        disabled={loadingL2}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.025] transition-all disabled:cursor-not-allowed disabled:opacity-80"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {loadingL2
              ? <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
              : <Microscope className="w-3 h-3 text-white/40" />}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">
              {loadingL2 ? "Loading deeper breakdown…" : "Go deeper"}
            </p>
            <p className="text-[10px] text-white/30">
              {loadingL2 ? "This takes a few seconds" : "System · Breakdown · Tipping point"}
            </p>
          </div>
        </div>
        {loadingL2
          ? <Loader2 className="w-4 h-4 text-white/30 animate-spin shrink-0" />
          : layer2
            ? (open ? <ChevronUp className="w-4 h-4 text-white/25 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/25 shrink-0" />)
            : <span className="text-[10px] font-bold border border-emerald-400/30 text-emerald-300 bg-emerald-400/10 rounded-full px-2 py-0.5">Tap</span>}
      </button>

      {open && layer2 && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
          {step1 && <div className="space-y-1.5"><p className="text-[10px] font-black uppercase tracking-widest text-blue-400/70">1 · The System</p><p className="text-sm text-foreground/80 leading-relaxed">{step1}</p></div>}
          {step2 && <div className="space-y-1.5"><p className="text-[10px] font-black uppercase tracking-widest text-purple-400/70">2 · Phrase Breakdown</p><p className="text-sm text-foreground/80 leading-relaxed">{step2}</p></div>}
          {step3 && <div className="space-y-1.5"><p className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">3 · Tipping Point</p><p className="text-sm text-foreground/80 leading-relaxed">{step3}</p></div>}
        </div>
      )}
    </div>
  );
}

function OptionsRecap({ question, selectedOption }) {
  const correct = question.correct;
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Options</p>
      {OPTION_KEYS.map(key => {
        const isCorrect = key === correct;
        const isWrongChosen = key === selectedOption && !isCorrect;
        return (
          <div key={key} className={`flex items-start gap-3 p-2.5 rounded-lg border ${isCorrect ? "border-l-4 border-green-500/70 bg-green-500/8" : isWrongChosen ? "border-l-4 border-red-400/70 bg-red-500/8" : "border-border/40 bg-secondary/30 opacity-50"}`}>
            <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${isCorrect ? "text-green-400" : isWrongChosen ? "text-red-400" : "text-muted-foreground"}`}>{key}</span>
            <span className="text-xs text-foreground/80 leading-relaxed">{question.options[key]}</span>
            {isCorrect && <span className="ml-auto text-[10px] text-green-400 font-bold shrink-0">✓ correct</span>}
            {isWrongChosen && <span className="ml-auto text-[10px] text-red-400 font-bold shrink-0">✗ chosen</span>}
          </div>
        );
      })}
    </div>
  );
}

function MyNoteWidget({ questionId, topic, questionText }) {
  const existing = getAllNotes()[questionId];
  const [editing, setEditing] = useState(!existing?.text);
  const [text, setText] = useState(existing?.text ?? "");
  const [saved, setSaved] = useState(false);
  if (!editing && existing?.text) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30"><div className="flex items-center gap-2"><span className="text-xs text-primary">✎</span><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p></div><button onClick={() => setEditing(true)} className="text-[11px] text-primary hover:brightness-110 transition-all">Edit</button></div>
        <div className="px-4 py-3"><p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{existing.text}</p></div>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30"><div className="flex items-center gap-2"><span className="text-xs text-primary">✎</span><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p></div>{existing?.text && <button onClick={() => { setEditing(false); setText(existing.text); }} className="text-[11px] text-muted-foreground hover:text-foreground">Cancel</button>}</div>
      <div className="p-3 space-y-2">
        <textarea value={text} onChange={e => { setText(e.target.value); setSaved(false); }} placeholder="Add a note — what clicked? What was the key idea?" rows={3} className="w-full bg-secondary/40 border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all leading-relaxed" />
        <div className="flex items-center justify-between"><p className="text-[10px] text-muted-foreground/30">Appears in the Notes panel</p><button onClick={() => { saveNote(questionId, text, { topic, questionText: (questionText ?? "").slice(0, 200) }); setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 2000); }} disabled={!text.trim()} className="flex items-center gap-1 text-xs font-bold text-primary hover:brightness-110 bg-primary/15 px-3 py-1.5 rounded-lg border border-primary/30 disabled:opacity-40 transition-all">{saved ? <><Check className="w-3 h-3" /> Saved</> : "Save note"}</button></div>
      </div>
    </div>
  );
}

function StarSection({ questionId, topic, questionText, feedback }) {
  const [starred, setStarred] = useState(() => checkStarred(questionId ?? "", SUBJECT));
  const existingEntry = getAllStarred(SUBJECT).find(e => e.questionId === questionId);
  const [showTeacherQInput, setShowTeacherQInput] = useState(false);
  const [teacherQ, setTeacherQ] = useState(existingEntry?.teacherQuestion ?? "");
  const [teacherQSaved, setTeacherQSaved] = useState(!!existingEntry?.teacherQuestion);
  const [teacherResponse, setTeacherResponse] = useState(existingEntry?.teacherResponse ?? "");
  const [teacherResponseSaved, setTeacherResponseSaved] = useState(false);

  function handleToggleStar() {
    if (!questionId) return;
    if (starred) { unstarQuestion(questionId, SUBJECT); setStarred(false); setShowTeacherQInput(false); }
    else { starQuestion(questionId, { topic, questionText, markScheme: "", feedback: { pulse_layer_1: feedback?.pulse_layer_1, cambridge_insight: feedback?.cambridge_insight } }, SUBJECT); setStarred(true); setShowTeacherQInput(!existingEntry?.teacherQuestion); }
  }
  function handleSaveTeacherQ() { if (!teacherQ.trim()) return; saveTeacherQuestion(questionId, teacherQ, SUBJECT); setTeacherQSaved(true); setShowTeacherQInput(false); setTimeout(() => setTeacherQSaved(false), 2000); }
  function handleSaveTeacherResponse() { saveTeacherResponse(questionId, teacherResponse, SUBJECT); setTeacherResponseSaved(true); setTimeout(() => setTeacherResponseSaved(false), 2500); }

  if (!starred) return <button onClick={handleToggleStar} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all active:scale-[0.98] bg-card border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5"><Star className="w-4 h-4" /> Star for teacher review</button>;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-amber-500/15"><div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" /><p className="text-xs text-amber-400 font-semibold">Starred for teacher review</p></div><button onClick={handleToggleStar} className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors shrink-0">Remove</button></div>
      <div className="px-4 py-3 space-y-1.5 border-b border-amber-500/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 flex items-center gap-1.5"><MessageCircleQuestion className="w-3 h-3" /> Your question for teacher</p>
        {teacherQSaved && !showTeacherQInput && teacherQ.trim() ? (
          <div className="flex items-start justify-between gap-2"><p className="text-[11px] text-foreground/80 italic flex-1">"{teacherQ}"</p><button onClick={() => setShowTeacherQInput(true)} className="text-[10px] text-amber-400/60 hover:text-amber-400 shrink-0">Edit</button></div>
        ) : (
          <div className="space-y-1.5">
            <textarea value={teacherQ} onChange={e => { setTeacherQ(e.target.value); setTeacherQSaved(false); }} placeholder="What would you like to ask your teacher?" rows={2} autoFocus className="w-full bg-card border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
            <div className="flex items-center justify-between">{existingEntry?.teacherQuestion && <button onClick={() => setShowTeacherQInput(false)} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground">Cancel</button>}<button onClick={handleSaveTeacherQ} disabled={!teacherQ.trim()} className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 disabled:opacity-40 transition-all hover:brightness-110">Save →</button></div>
          </div>
        )}
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /><p className="text-[10px] font-black uppercase tracking-widest text-amber-400">What the teacher said</p></div>
        <textarea value={teacherResponse} onChange={e => { setTeacherResponse(e.target.value); setTeacherResponseSaved(false); }} placeholder="Type the teacher's response here, or leave blank to fill in by hand when printed…" rows={3} className="w-full bg-card border border-amber-500/20 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all leading-relaxed" />
        <div className="flex justify-end"><button onClick={handleSaveTeacherResponse} disabled={teacherResponse === (existingEntry?.teacherResponse ?? "")} className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 disabled:opacity-40 transition-all hover:brightness-110">{teacherResponseSaved ? <><Check className="w-3 h-3" /> Saved</> : "Save"}</button></div>
      </div>
    </div>
  );
}

// ── Memoized OptionRow — only re-renders when its own props change ─────────
const OptionRow = memo(function OptionRow({ optKey, text, selected, crossedOut, onSelect, onToggleCrossOut }) {
  const isSelected = selected === optKey;

  let containerCls = "relative w-full flex items-center gap-2 p-3.5 rounded-xl border text-left transition-colors ";
  if (crossedOut) {
    containerCls += "border-border/30 bg-secondary/20 opacity-50";
  } else if (isSelected) {
    containerCls += "border-l-4 border-amber-400 bg-amber-400/8";
  } else {
    containerCls += "border-border hover:border-border/80";
  }

  return (
    <div className={containerCls}>
      <span className={`font-mono text-xs font-bold mt-0.5 shrink-0 w-5 text-center transition-colors ${
        isSelected ? "text-amber-400" : crossedOut ? "text-muted-foreground/30" : "text-muted-foreground"
      }`}>{optKey}</span>

      <button
        type="button"
        onPointerDown={() => !crossedOut && onSelect(optKey)}
        disabled={crossedOut}
        className={`flex-1 min-w-0 text-left text-sm leading-relaxed ${crossedOut ? "line-through text-muted-foreground/30 cursor-not-allowed" : "text-foreground/90 cursor-pointer"}`}
        style={{ background: "none", border: "none", padding: 0 }}
      >
        {text}
      </button>

      <button
        type="button"
        onPointerDown={e => { e.stopPropagation(); onToggleCrossOut(optKey); }}
        title={crossedOut ? "Restore option" : "Cross out — eliminate this option"}
        className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors active:scale-90 ${
          crossedOut
            ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
            : "bg-secondary/60 border border-border/60 text-muted-foreground/40 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400"
        }`}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {crossedOut && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-10 right-10 h-px bg-muted-foreground/40" />
        </div>
      )}
    </div>
  );
});

export default function MCQSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const { topic, guessReviewMode, guessReviewBank, sessionIndex } = state ?? {};

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(sessionIndex ?? 0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [crossedOut, setCrossedOut] = useState(new Set());
  const [isGuess, setIsGuess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingL2, setLoadingL2] = useState(false);
  const [showCorrectBanner, setShowCorrectBanner] = useState(false);
  const [noSelectionError, setNoSelectionError] = useState(false);
  const autoAdvanceTimer = useRef(null);

  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [calcActive, setCalcActive] = useState(false);
  const [formulaSheetOpen, setFormulaSheetOpen] = useState(false);
  const [workings, setWorkings] = useState({});

  useEffect(() => {
    if (guessReviewMode) {
      const { MCQ_QUESTIONS } = require("@/lib/mcqBank");
      const qs = (guessReviewBank ?? []).map(id => MCQ_QUESTIONS.find(q => q.id === id)).filter(Boolean);
      setQuestions(qs);
    } else {
      if (!topic) { navigate(-1); return; }
      setQuestions(getQuestionsForTopic(topic));
    }
  }, [topic, guessReviewMode]);

  useEffect(() => {
    loadWorkings(PAPER_ID).then(w => setWorkings(w ?? {}));
  }, []);

  useEffect(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    const existing = answers[questions[currentIdx]?.id];
    setSelected(existing?.chosen ?? null);
    setIsGuess(existing?.flagged_as_guess ?? false);
    setCrossedOut(new Set());
    setShowCorrectBanner(!!existing && existing.correct && !existing.flagged_as_guess);
    setNoSelectionError(false);
    setLoadingL2(false);
  }, [currentIdx, questions]);

  useEffect(() => () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); }, []);

  if (questions.length === 0) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  const question = questions[currentIdx];
  if (!question) { navigate(-1); return null; }

  const existingAnswer = answers[question.id];
  const submitted = !!existingAnswer;
  const layer1 = existingAnswer?.layer1 ?? null;
  const layer2 = existingAnswer?.layer2 ?? null;
  const isCorrect = existingAnswer?.correct ?? false;

  const sessionAnswerMap = {};
  questions.forEach(q => { const a = answers[q.id]; if (a) sessionAnswerMap[q.id] = a.correct ? "correct" : "wrong"; });

  const allNotes = getAllNotes();
  const notesCount = questions.filter(q => allNotes[q.id]?.text).length + getAllStarred(SUBJECT).length;
  const isLast = currentIdx >= questions.length - 1;
  const crossedCount = crossedOut.size;

  // ── useCallback handlers so OptionRow doesn't re-render siblings ──
  const handleSelect = useCallback((key) => {
    setSelected(key);
    setNoSelectionError(false);
  }, []);

  const handleToggleCrossOut = useCallback((key) => {
    setCrossedOut(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); }
      else { next.add(key); if (selected === key) setSelected(null); }
      return next;
    });
  }, [selected]);

  function handleSaveWorking(side, imageData) {
    if (!question) return;
    const updated = saveTopicWorking(PAPER_ID, question.id, side, imageData, { questionNumber: currentIdx + 1, topic: question.topic, questionText: question.text });
    setWorkings({ ...updated });
  }

  function advanceToNext() {
    if (isLast) { if (guessReviewMode) navigate("/guess-review-bank"); else navigate(-1); }
    else { setCurrentIdx(i => i + 1); }
  }

  async function handleSubmit() {
    if (!selected) { setNoSelectionError(true); return; }
    if (loading || submitted) return;
    setLoading(true);
    setNoSelectionError(false);
    const isCorrectAnswer = selected === question.correct;
    await recordAttempt(question.topic, isCorrectAnswer ? 1 : 0, { total_marks: 1, question_id: question.id });
    await saveMCQAttempt({ question_id: question.id, topic: question.topic, source: question.source, chosen_option: selected, correct_option: question.correct, correct: isCorrectAnswer, flagged_as_guess: isGuess, reasoning: null });
    if (guessReviewMode && (isCorrectAnswer || isGuess)) await resetGuessReviewBankLock(question.id).catch(() => {});
    if (isCorrectAnswer && !isGuess) {
      setAnswers(prev => ({ ...prev, [question.id]: { chosen: selected, correct: true, flagged_as_guess: false, layer1: null, layer2: null } }));
      setShowCorrectBanner(true); setLoading(false);
      autoAdvanceTimer.current = setTimeout(() => advanceToNext(), 1500);
      return;
    }
    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const prompt = `Cambridge A Level Physics MCQ.\nQuestion: ${question.text}\nOptions: ${optionsList}\nCorrect answer: ${question.correct} (${question.options[question.correct]})\nStudent chose: ${selected} — WRONG\n${isGuess ? "Student flagged this as a guess." : ""}\nRespond ONLY in JSON (no extra text):\n{\n  "marks_earned": 0,\n  "cambridge_insight": "One clear sentence explaining exactly why ${question.correct} is correct and where the student went wrong.",\n  "pulse_layer_1": "The reusable exam rule. Maximum 12 words."\n}`;
    let fb = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6", response_json_schema: { type: "object", properties: { marks_earned: { type: "number" }, cambridge_insight: { type: "string" }, pulse_layer_1: { type: "string" } }, required: ["cambridge_insight", "pulse_layer_1"] } });
      fb = r?.response ?? r;
    } catch { fb = { cambridge_insight: question.explanation ?? "See the correct answer above.", pulse_layer_1: question.explanation ?? "" }; }
    setAnswers(prev => ({ ...prev, [question.id]: { chosen: selected, correct: false, flagged_as_guess: isGuess, layer1: fb, layer2: null } }));
    setLoading(false);
  }

  async function handleLoadLayer2() {
    if (loadingL2 || layer2) return;
    setLoadingL2(true);
    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const prompt = `Cambridge A Level Physics MCQ.\nQuestion: ${question.text}\nOptions: ${optionsList}\nCorrect: ${question.correct} (${question.options[question.correct]})\nStudent chose: ${selected} — WRONG\nRespond ONLY in JSON:\n{\n  "step1_system": "One sentence: what concept is this question testing.",\n  "step2_phrase_breakdown": "1-2 sentences: which words in the question carry hidden meaning.",\n  "step3_tipping_point": "One sentence: the exact logical boundary that separates ${question.correct} from the wrong options."\n}`;
    let fb2 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6", response_json_schema: { type: "object", properties: { step1_system: { type: "string" }, step2_phrase_breakdown: { type: "string" }, step3_tipping_point: { type: "string" } }, required: ["step1_system", "step2_phrase_breakdown", "step3_tipping_point"] } });
      fb2 = r?.response ?? r;
    } catch { fb2 = { step1_system: "Could not load breakdown.", step2_phrase_breakdown: "", step3_tipping_point: "" }; }
    setAnswers(prev => ({ ...prev, [question.id]: { ...prev[question.id], layer2: fb2 } }));
    setLoadingL2(false);
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        <QuestionSessionHeader
          paperRef={question.source ?? "9702 Paper 1"}
          subject="Physics"
          currentIdx={currentIdx}
          total={questions.length}
          allQuestions={questions.map(q => ({ id: q.id, topic: q.topic }))}
          sessionAnswers={sessionAnswerMap}
          onBack={() => navigate(-1)}
          onJumpTo={(i) => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); setCurrentIdx(i); }}
          notesCount={notesCount}
          onNotesPanel={() => setNotesPanelOpen(true)}
          showCalculator={true}
          calcActive={calcActive}
          onCalcToggle={() => setCalcActive(a => !a)}
          onFormulaSheet={() => setFormulaSheetOpen(true)}
        />

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">
          {calcActive && <div className="relative z-10"><ScientificCalculator onClose={() => setCalcActive(false)} /></div>}

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-900 bg-amber-400/80 px-3 py-1 rounded-full">Multiple Choice</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{question.topic}</span>
                {submitted && (
                  <button
                    onClick={() => { if (checkStarred(question.id, SUBJECT)) { unstarQuestion(question.id, SUBJECT); } else { starQuestion(question.id, { topic: question.topic, questionText: question.text, markScheme: "", feedback: { pulse_layer_1: layer1?.pulse_layer_1, cambridge_insight: layer1?.cambridge_insight } }, SUBJECT); } }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${checkStarred(question.id, SUBJECT) ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-secondary border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"}`}>
                    <Star className={`w-3 h-3 ${checkStarred(question.id, SUBJECT) ? "fill-amber-400" : ""}`} />
                    {checkStarred(question.id, SUBJECT) ? "Starred" : "Star"}
                  </button>
                )}
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-foreground/90">{question.text}</p>
          </div>

          {!submitted ? (
            <>
              {crossedCount > 0 && (
                <p className="text-[11px] text-muted-foreground/40 text-center -mt-2">
                  {crossedCount} option{crossedCount !== 1 ? "s" : ""} crossed out — tap ✕ to eliminate more
                </p>
              )}

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

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => { setIsGuess(g => !g); setNoSelectionError(false); }}
                  className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-colors shrink-0 ${
                    isGuess ? "bg-amber-400 text-amber-900 border-amber-400" : "bg-secondary border-border text-muted-foreground hover:brightness-110"
                  }`}
                >
                  🎲 {isGuess ? "Guess!" : "Just a guess"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selected || loading}
                  className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />Marking…</span>
                    : "Submit Answer"}
                </button>
              </div>
            </>
          ) : (
            <>
              <OptionsRecap question={question} selectedOption={existingAnswer?.chosen} />
              {showCorrectBanner && <CorrectBanner />}
              {!isCorrect && layer1 && <Layer1Feedback feedback={layer1} isGuess={existingAnswer?.flagged_as_guess ?? false} />}

              {(!isCorrect || existingAnswer?.flagged_as_guess) && (
                <>
                  <MyNoteWidget key={`note-${question.id}`} questionId={question.id} topic={question.topic} questionText={question.text} />
                  <StarSection key={`star-${question.id}`} questionId={question.id} topic={question.topic} questionText={question.text} feedback={layer1} />
                  <Layer2OnDemand
                    feedback={layer1}
                    question={question}
                    selectedOption={existingAnswer?.chosen}
                    loadingL2={loadingL2}
                    onLoad={handleLoadLayer2}
                    layer2={layer2}
                  />
                </>
              )}

              {!showCorrectBanner && (
                <button onClick={advanceToNext} className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-colors">
                  {isLast ? (guessReviewMode ? "Back to review bank →" : "Finish →") : "Next question →"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ScratchpadPanel questionId={question.id} paperId={PAPER_ID} workings={workings} onSaveWorking={handleSaveWorking} />
      <SessionNotesPanel open={notesPanelOpen} onClose={() => setNotesPanelOpen(false)} allQuestions={questions.map((q, i) => ({ id: q.id, topic: q.topic, text: q.text }))} currentIdx={currentIdx} onJumpTo={(i) => { setCurrentIdx(i); setNotesPanelOpen(false); }} subject={SUBJECT} userEmail={user?.email ?? ""} />
      {formulaSheetOpen && <FormulaSheetModal onClose={() => setFormulaSheetOpen(false)} />}
    </div>
  );
}