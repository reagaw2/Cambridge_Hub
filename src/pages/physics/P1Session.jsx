import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, Calculator, Grid3X3, ChevronDown, Zap, Microscope, Loader2, Star, Download, Pencil, NotebookPen, MessageCircleQuestion } from "lucide-react";
import { getP1Paper } from "@/lib/physicsP1Bank";
import { base44 } from "@/api/base44Client";
import ScientificCalculator from "@/components/ScientificCalculator";
import { saveMCQAttempt } from "@/lib/topicStore";
import { loadP1Session, saveP1Session, clearP1Session } from "@/lib/p1SessionStore";
import { getStarredQuestions, starQuestion, unstarQuestion, saveTeacherQuestion } from "@/lib/p1StarStore";
import { generateStarredPdf } from "@/lib/p1StarPdf";
import { getNotes, saveNote } from "@/lib/p1NotesStore";
import { generateNotesPdf } from "@/lib/p1NotesPdf";
import { loadScratchpadForPaper } from "@/lib/p1ScratchpadStore";
import PaperPdfButton from "@/components/PaperPdfButton";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import ScratchpadPanel from "@/components/ScratchpadPanel";
import { useAuth } from "@/lib/AuthContext";

const OPTION_KEYS = ["A", "B", "C", "D"];

function CorrectBanner() {
  return (
    <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-5 flex flex-col items-center gap-2 text-center">
      <CheckCircle2 className="w-8 h-8 text-green-400" />
      <p className="text-lg font-bold text-green-400">Correct! Well done.</p>
      <p className="text-[11px] text-green-400/60">Moving to next question…</p>
    </div>
  );
}

function Layer1Feedback({ feedback, isCorrect, isGuess }) {
  const accentBg = isGuess ? "bg-amber-500/10 border-amber-500/25" : "bg-red-500/10 border-red-500/25";
  const accent = isGuess ? "text-amber-400" : "text-red-400";
  return (
    <div className="space-y-3">
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${accentBg}`}>
        <span className="text-2xl shrink-0">{isGuess && isCorrect ? "🎲" : isGuess ? "🎲" : "❌"}</span>
        <div>
          <p className={`text-sm font-bold ${accent}`}>
            {isGuess && isCorrect ? "Correct — but flagged as a guess" : isGuess ? "Incorrect — flagged as a guess" : "Incorrect"}
          </p>
          {(isGuess || !isCorrect) && (
            <p className="text-[11px] text-muted-foreground mt-0.5">Added to your review bank</p>
          )}
        </div>
      </div>
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
      {feedback.cambridge_insight && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
        </div>
      )}
    </div>
  );
}

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

function FormulaSheet({ onClose, imageUrl }) {
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
          {imageUrl ? (
            <img src={imageUrl} alt="Formula sheet" className="w-full rounded-lg" style={{ background: "#fff" }} />
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Formula sheet not available for this paper. Please refer to your Cambridge data booklet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewPanel({ questions, answers, currentIdx, onJump, onClose, onClear, starredIds, notedIds }) {
  const topics = [...new Set(questions.map(q => q.topic))];
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">Question Overview</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {Object.keys(answers).length} of {questions.length} answered
              {starredIds.size > 0 && <span className="ml-2 text-amber-400">· {starredIds.size} ⭐</span>}
              {notedIds.size > 0 && <span className="ml-2 text-green-400">· {notedIds.size} 📝</span>}
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
          <span>⭐ Starred · 📝 Note</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            const isAnswered = !!a?.chosen;
            const isStarred = starredIds.has(q.id);
            const hasNote = notedIds.has(q.id);
            return (
              <button key={q.id} onClick={() => { onJump(i); onClose(); }} title={`Q${q.number}: ${q.topic}`}
                className={`relative w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                  isCurrent ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                  : a?.flagged_as_guess ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : isAnswered && a?.correct ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : isAnswered && !a?.correct ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                }`}>
                {q.number}
                {isStarred && <span className="absolute -top-1 -right-1 text-[7px] leading-none">⭐</span>}
                {hasNote && !isStarred && <span className="absolute -top-1 -right-1 text-[7px] leading-none">📝</span>}
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
        <button onClick={onClear} className="w-full py-2.5 rounded-xl border border-red-500/25 text-red-400/70 text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 transition-all">
          Clear progress & restart
        </button>
      </div>
    </div>
  );
}

function StarredPanel({ paperId, paperLabel, paper, starredQuestions, notes, onClose, onJump, questions, userEmail, onTeacherQuestionSave }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingNotes, setDownloadingNotes] = useState(false);
  const [teacherInputs, setTeacherInputs] = useState(() => {
    const init = {};
    Object.entries(starredQuestions).forEach(([id, entry]) => { init[id] = entry.teacherQuestion ?? ""; });
    return init;
  });
  const starred = Object.entries(starredQuestions).sort((a, b) => a[1].questionNumber - b[1].questionNumber);
  const noteCount = Object.keys(notes).length;

  async function handleDownloadStarred() { setDownloading(true); await generateStarredPdf({ paperId, paperLabel, starredQuestions, userEmail }); setDownloading(false); }
  async function handleDownloadNotes() { setDownloadingNotes(true); await generateNotesPdf({ paperId, paperLabel, session: paper.session, variant: paper.id?.split("/")?.[1] ?? "", notes, starredQuestions, questions, userEmail }); setDownloadingNotes(false); }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <p className="font-bold text-foreground">Starred & Notes</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{starred.length} starred · {noteCount} note{noteCount !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {starred.length === 0 && noteCount === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <Star className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            </div>
          )}
          {starred.map(([questionId, entry]) => (
            <div key={questionId} className="bg-secondary/40 border border-border rounded-xl overflow-hidden">
              <div className="flex items-start justify-between gap-2 p-4 pb-2">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-primary">Q{entry.questionNumber}</span>
                    <span className="text-[11px] text-muted-foreground">{entry.topic}</span>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{entry.questionText}</p>
                </div>
                <button onClick={() => { const idx = questions.findIndex(q => q.id === questionId); if (idx >= 0) { onJump(idx); onClose(); } }} className="text-[11px] font-semibold text-primary shrink-0 px-2 py-1 rounded-lg bg-primary/10 hover:brightness-110 transition-all">Go to →</button>
              </div>
              {entry.feedback?.pulse_layer_1 && (
                <div className="mx-4 mb-2 bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-0.5">Takeaway</p>
                  <p className="text-[11px] text-foreground/70 leading-relaxed">{entry.feedback.pulse_layer_1}</p>
                </div>
              )}
              {notes[questionId]?.text && (
                <div className="mx-4 mb-2 bg-green-500/8 border border-green-500/20 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 mb-0.5">📝 My Note</p>
                  <p className="text-[11px] text-foreground/70 leading-relaxed">{notes[questionId].text}</p>
                </div>
              )}
              <div className="px-4 pb-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 flex items-center gap-1.5 mt-2">
                  <MessageCircleQuestion className="w-3 h-3" /> Question for teacher
                </p>
                {entry.teacherQuestion ? (
                  <div className="space-y-1.5">
                    <div className="bg-amber-500/8 border border-amber-500/25 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-foreground/80 leading-relaxed">{entry.teacherQuestion}</p>
                    </div>
                    <button onClick={() => { onTeacherQuestionSave(questionId, ""); }} className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors">Edit question</button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <textarea
                      value={teacherInputs[questionId] ?? ""}
                      onChange={e => setTeacherInputs(p => ({ ...p, [questionId]: e.target.value }))}
                      placeholder="What would you like to ask your teacher about this question?"
                      rows={2}
                      className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
                    />
                    <button
                      onClick={() => onTeacherQuestionSave(questionId, teacherInputs[questionId] ?? "")}
                      disabled={!teacherInputs[questionId]?.trim()}
                      className="text-xs font-semibold text-amber-400 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save question →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 px-4 py-4 border-t border-border/50 space-y-2">
          <button onClick={handleDownloadNotes} disabled={(starred.length === 0 && noteCount === 0) || downloadingNotes} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {downloadingNotes ? <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Generating…</> : <><NotebookPen className="w-4 h-4" /> Download My Notes (PDF)</>}
          </button>
          <button onClick={handleDownloadStarred} disabled={starred.length === 0 || downloading} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {downloading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generating…</> : <><Download className="w-4 h-4" /> Teacher Review PDF (starred only)</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniNoteWidget({ questionId, paperId, notes, onNoteSaved }) {
  const existing = notes[questionId];
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(existing?.text ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave() { const updated = saveNote(paperId, questionId, text); onNoteSaved(updated); setSaved(true); setTimeout(() => setSaved(false), 2000); if (!text.trim()) setOpen(false); }
  function handleKeyDown(e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }

  if (!open && !existing?.text) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/60 hover:text-green-400 hover:border-green-500/30 border border-border/40 bg-secondary/40 px-3 py-2 rounded-xl transition-all w-full">
        <Pencil className="w-3.5 h-3.5" /> Add a note
      </button>
    );
  }

  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Pencil className="w-3.5 h-3.5 text-green-400" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-green-400/70">My Note</p>
        </div>
        {existing?.text && !open && <button onClick={() => setOpen(true)} className="text-[10px] text-green-400/60 hover:text-green-400 transition-colors">Edit</button>}
      </div>
      {open ? (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="What did you understand? What confused you?" rows={3} autoFocus className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/40 transition-all" />
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => { setOpen(false); setText(existing?.text ?? ""); }} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Cancel</button>
            <div className="flex items-center gap-2">
              {text.trim() && <button onClick={() => { setText(""); saveNote(paperId, questionId, ""); onNoteSaved({}); setOpen(false); }} className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors">Delete note</button>}
              <button onClick={handleSave} className="text-xs font-bold text-green-400 hover:brightness-110 transition-all bg-green-500/15 px-3 py-1.5 rounded-lg border border-green-500/30">{saved ? "Saved ✓" : "Save note"}</button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/30">⌘ + Enter to save</p>
        </>
      ) : (
        <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{existing?.text}</p>
      )}
    </div>
  );
}

function TeacherQuestionInline({ questionId, existing, onSave, onSkip }) {
  const [text, setText] = useState(existing ?? "");
  return (
    <div className="px-4 pb-4 space-y-2 border-t border-amber-500/20 pt-3">
      <div className="flex items-center gap-1.5">
        <MessageCircleQuestion className="w-3.5 h-3.5 text-amber-400/70" />
        <p className="text-[11px] font-bold text-amber-400/80">Want to ask your teacher something?</p>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Why does the wave function collapse?" rows={2} autoFocus className="w-full bg-card border border-amber-500/25 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
      <div className="flex items-center justify-between">
        <button onClick={onSkip} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Skip for now</button>
        <button onClick={() => onSave(text)} disabled={!text.trim()} className="text-xs font-bold text-amber-400 hover:brightness-110 transition-all bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed">Save question →</button>
      </div>
    </div>
  );
}

function OptionRow({ optKey, text, selected, crossedOut, submitted, correctOption, onSelect, onToggleCrossOut }) {
  const isCorrectOption = optKey === correctOption;
  const isWrongChosen = submitted && optKey === selected && !isCorrectOption;

  let containerCls = "group relative w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all select-none ";
  if (submitted) {
    if (isCorrectOption) containerCls += "border-l-4 border-green-500 bg-green-500/10";
    else if (isWrongChosen) containerCls += "border-l-4 border-red-400 bg-red-500/10";
    else containerCls += "border-border/40 bg-secondary/30 opacity-40";
  } else if (crossedOut) {
    containerCls += "border-border/30 bg-secondary/20 opacity-50";
  } else {
    containerCls += selected === optKey ? "border-l-4 border-primary bg-primary/10 cursor-pointer" : "border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
  }

  return (
    <div className={containerCls}>
      <button type="button" disabled={submitted} onClick={() => !submitted && !crossedOut && onSelect(optKey)} className="flex items-start gap-3 flex-1 min-w-0 text-left" style={{ background: "none", border: "none", padding: 0 }}>
        <span className={`font-mono text-xs font-black shrink-0 mt-0.5 w-4 transition-colors ${submitted && isCorrectOption ? "text-green-400" : submitted && isWrongChosen ? "text-red-400" : selected === optKey ? "text-primary" : crossedOut ? "text-muted-foreground/30" : "text-muted-foreground"}`}>{optKey}</span>
        <span className={`text-sm leading-relaxed flex-1 min-w-0 transition-all ${crossedOut ? "line-through text-muted-foreground/30" : "text-foreground/90"}`}>{text}</span>
      </button>
      {!submitted && (
        <button type="button" onClick={e => { e.stopPropagation(); onToggleCrossOut(optKey); }} title={crossedOut ? "Restore option" : "Cross out this option"} className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ml-1 mt-0.5 ${crossedOut ? "bg-red-500/25 border border-red-500/50 text-red-400 opacity-100" : "opacity-0 group-hover:opacity-100 bg-secondary border border-border text-muted-foreground/50 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400"}`}>
          <X className="w-3 h-3" />
        </button>
      )}
      {submitted && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
      {submitted && isWrongChosen && <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
      {crossedOut && !submitted && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-3 right-3 h-px bg-muted-foreground/30" />
        </div>
      )}
    </div>
  );
}

// ── Main session ──────────────────────────────────────────────────────────────
export default function P1Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const paperId = location.state?.paperId ?? "9702/12/F/M/25";
  const paper = getP1Paper(paperId);
  const questions = paper.questions;

  const [sessionLoading, setSessionLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const [selected, setSelected] = useState(null);
  const [isGuess, setIsGuess] = useState(false);
  const [crossedOut, setCrossedOut] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingL2, setLoadingL2] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCorrectBanner, setShowCorrectBanner] = useState(false);
  const [layer1, setLayer1] = useState(null);
  const [layer2, setLayer2] = useState(null);

  const [starredQuestions, setStarredQuestions] = useState(() => getStarredQuestions(paperId));
  const [notes, setNotes] = useState(() => getNotes(paperId));
  const [showTeacherPrompt, setShowTeacherPrompt] = useState(false);

  const autoAdvanceTimer = useRef(null);

  // Load session + scratchpad data on mount
  useEffect(() => {
    setSessionLoading(true);
    setStarredQuestions(getStarredQuestions(paperId));
    setNotes(getNotes(paperId));

    Promise.all([
      loadP1Session(paperId),
      loadScratchpadForPaper(paperId).catch(() => {}), // non-blocking
    ]).then(([session]) => {
      setAnswers(session.answers ?? {});
      setCurrentIdx(session.currentIdx ?? 0);
      setSessionLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const question = questions[currentIdx];
  const existingAnswer = answers[question?.id];

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (sessionLoading) return;
    saveP1Session(paperId, answers, currentIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentIdx, sessionLoading]);

  useEffect(() => {
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); };
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setSelected(existingAnswer?.chosen ?? null);
    setIsGuess(existingAnswer?.flagged_as_guess ?? false);
    setCrossedOut(new Set());
    setSubmitted(!!existingAnswer);
    setShowCorrectBanner(false);
    setLayer1(existingAnswer?.layer1 ?? null);
    setLayer2(existingAnswer?.layer2 ?? null);
    setShowCalc(false);
    setShowTeacherPrompt(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, sessionLoading]);

  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount / questions.length;
  const starredIds = new Set(Object.keys(starredQuestions));
  const notedIds = new Set(Object.keys(notes));
  const isCurrentStarred = question ? starredIds.has(question.id) : false;

  function handleToggleCrossOut(key) {
    setCrossedOut(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); if (selected === key) setSelected(null); }
      return next;
    });
  }

  function getMergedFeedback() {
    if (!layer1) return null;
    return { ...layer1, ...(layer2 ?? {}) };
  }

  function handleToggleStar() {
    if (!question) return;
    if (isCurrentStarred) {
      const updated = unstarQuestion(paperId, question.id);
      setStarredQuestions({ ...updated });
      setShowTeacherPrompt(false);
    } else {
      const merged = getMergedFeedback();
      const updated = starQuestion(paperId, question, merged);
      setStarredQuestions({ ...updated });
      setShowTeacherPrompt(true);
    }
  }

  useEffect(() => {
    if (!question || !layer1 || !layer2 || !isCurrentStarred) return;
    const merged = getMergedFeedback();
    const updated = starQuestion(paperId, question, merged, starredQuestions[question.id]?.teacherQuestion);
    setStarredQuestions({ ...updated });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer2]);

  function handleTeacherQuestionSave(questionId, value) {
    const updated = saveTeacherQuestion(paperId, questionId, value);
    setStarredQuestions({ ...updated });
  }

  async function handleClear() {
    await clearP1Session(paperId);
    setAnswers({}); setCurrentIdx(0); setSelected(null); setIsGuess(false);
    setCrossedOut(new Set()); setSubmitted(false); setShowCorrectBanner(false);
    setLayer1(null); setLayer2(null); setShowOverview(false);
  }

  function advanceQuestion() {
    if (currentIdx < questions.length - 1) { setCurrentIdx(i => i + 1); }
    else { navigate("/physics/p1-summary", { state: { answers, questions, paperId: paper.id } }); }
  }

  async function handleSubmit() {
    if (!selected || loading || submitted) return;
    setLoading(true);
    const isCorrect = selected === question.correct;

    await saveMCQAttempt({ question_id: question.id, topic: question.topic, source: paper.id, chosen_option: selected, correct_option: question.correct, correct: isCorrect, flagged_as_guess: isGuess, reasoning: isGuess ? null : selected });

    if (isCorrect && !isGuess) {
      const record = { chosen: selected, correct: true, flagged_as_guess: false, layer1: null, layer2: null };
      setAnswers(prev => ({ ...prev, [question.id]: record }));
      setSubmitted(true); setShowCorrectBanner(true); setLoading(false);
      autoAdvanceTimer.current = setTimeout(() => { advanceQuestion(); }, 1500);
      return;
    }

    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const l1prompt = `Cambridge A Level Physics MCQ. Q${question.number}: ${question.text}
Options: ${optionsList}
Correct: ${question.correct} (${question.options[question.correct]})
Student chose: ${selected} — ${isCorrect ? "CORRECT" : "WRONG"}
${isGuess ? "Student flagged this as a guess." : ""}
Respond ONLY in JSON:
{ "marks_earned": ${isCorrect ? 1 : 0}, "cambridge_insight": "One sentence: why ${question.correct} is the right answer.", "pulse_layer_1": "The reusable exam rule. Max 12 words." }`;

    let fb1 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({ prompt: l1prompt, model: "claude_sonnet_4_6", response_json_schema: { type: "object", properties: { marks_earned: { type: "number" }, cambridge_insight: { type: "string" }, pulse_layer_1: { type: "string" } }, required: ["marks_earned", "cambridge_insight", "pulse_layer_1"] } });
      fb1 = r?.response ?? r;
    } catch {
      fb1 = { marks_earned: isCorrect ? 1 : 0, cambridge_insight: question.explanation, pulse_layer_1: question.explanation };
    }

    const record = { chosen: selected, correct: isCorrect, flagged_as_guess: isGuess, layer1: fb1, layer2: null };
    setAnswers(prev => ({ ...prev, [question.id]: record }));
    setLayer1(fb1); setLayer2(null); setSubmitted(true); setLoading(false);
  }

  async function handleRequestLayer2() {
    if (loadingL2 || layer2) return;
    setLoadingL2(true);
    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const l2prompt = `Cambridge A Level Physics MCQ. Q${question.number}: ${question.text}
Options: ${optionsList}
Correct: ${question.correct} (${question.options[question.correct]})
Student chose: ${selected} — ${existingAnswer?.correct ? "CORRECT" : "WRONG"}
Respond ONLY in JSON:
{ "step1_system": "One sentence: what concept this tests.", "step2_phrase_breakdown": "1-2 sentences: which words/quantities matter.", "step3_tipping_point": "One sentence: what separates ${question.correct} from the tempting wrong option." }`;

    let fb2 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({ prompt: l2prompt, model: "claude_sonnet_4_6", response_json_schema: { type: "object", properties: { step1_system: { type: "string" }, step2_phrase_breakdown: { type: "string" }, step3_tipping_point: { type: "string" } }, required: ["step1_system", "step2_phrase_breakdown", "step3_tipping_point"] } });
      fb2 = r?.response ?? r;
    } catch {
      fb2 = { step1_system: "Could not load breakdown.", step2_phrase_breakdown: "", step3_tipping_point: "" };
    }

    setLayer2(fb2);
    setAnswers(prev => ({ ...prev, [question.id]: { ...prev[question.id], layer2: fb2 } }));
    setLoadingL2(false);
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your progress…</p>
      </div>
    );
  }

  if (!question) return null;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === questions.length - 1;
  const totalStarredAndNoted = starredIds.size + notedIds.size;
  const showFeedbackPanel = submitted && layer1 !== null;
  const crossedCount = crossedOut.size;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-foreground">{paper.label}</p>
              <p className="text-[10px] text-muted-foreground">Q{currentIdx + 1} of {questions.length}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowCalc(c => !c)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${showCalc ? "bg-primary/20 border-primary/50 text-primary" : "bg-secondary border-border text-muted-foreground hover:brightness-110"}`}>
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calc</span>
              </button>
              <button onClick={() => setShowFormulas(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:brightness-110 transition-all">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Data</span>
              </button>
              <button onClick={() => setShowStarred(true)}
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${totalStarredAndNoted > 0 ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-secondary border-border text-muted-foreground hover:brightness-110"}`}>
                <NotebookPen className={`w-3.5 h-3.5 ${totalStarredAndNoted > 0 ? "text-amber-400" : ""}`} />
                {totalStarredAndNoted > 0 && <span className="font-mono text-[10px]">{totalStarredAndNoted}</span>}
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

        {/* PDF access banner */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-card/40">
          <PaperPdfButton label="Open Question Paper" paperId={paperId} />
          <p className="text-[11px] text-muted-foreground/60 leading-snug">
            Open the PDF to see diagrams for image questions
          </p>
        </div>

        {/* Compact overview strip */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b border-border/30 bg-card/40">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            const isAnswered = !!a?.chosen;
            const isStarred = starredIds.has(q.id);
            const hasNote = notedIds.has(q.id);
            return (
              <button key={q.id} onClick={() => setCurrentIdx(i)}
                className={`relative shrink-0 w-6 h-6 rounded-md text-[9px] font-bold border transition-all ${
                  isCurrent ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                  : a?.flagged_as_guess ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : isAnswered && a?.correct ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : isAnswered && !a?.correct ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-secondary/60 border-border/40 text-muted-foreground/50"
                }`}>
                {q.number}
                {isStarred && <span className="absolute -top-1 -right-1 text-[7px] leading-none">⭐</span>}
                {hasNote && !isStarred && <span className="absolute -top-1 -right-1 text-[7px] leading-none">📝</span>}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">Question {question.number}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{question.topic}</span>
                {submitted && (
                  <button onClick={handleToggleStar} title={isCurrentStarred ? "Remove star" : "Star for teacher review"}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${isCurrentStarred ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-secondary border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"}`}>
                    <Star className={`w-3.5 h-3.5 ${isCurrentStarred ? "fill-amber-400" : ""}`} />
                    <span>{isCurrentStarred ? "Starred" : "Star"}</span>
                  </button>
                )}
              </div>
            </div>

            {question.image_required && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center gap-2.5">
                <span className="text-base shrink-0">📊</span>
                <p className="text-[11px] text-primary/80 leading-snug">
                  This question has a diagram — see <strong>Q{question.number}</strong> in the question paper PDF above
                </p>
              </div>
            )}

            <QuestionAnnotator text={question.text} questionId={question.id} />
          </div>

          {/* Elimination hint */}
          {!submitted && (
            <p className="text-[11px] text-muted-foreground/50 text-center -mt-1">
              Hover an option and tap <span className="font-mono bg-secondary px-1 rounded">✕</span> to cross it out by elimination
              {crossedCount > 0 && <span className="text-red-400/70 ml-1">· {crossedCount} crossed out</span>}
            </p>
          )}

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {OPTION_KEYS.map(key => (
              <OptionRow key={key} optKey={key} text={question.options[key]} selected={selected} crossedOut={crossedOut.has(key)} submitted={submitted} correctOption={question.correct} onSelect={setSelected} onToggleCrossOut={handleToggleCrossOut} />
            ))}
          </div>

          {/* Guess + Submit */}
          {!submitted && (
            <div className="flex gap-2">
              <button onClick={() => setIsGuess(g => !g)}
                className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all shrink-0 ${isGuess ? "bg-amber-400 text-amber-900 border-amber-400" : "bg-secondary border-border text-muted-foreground hover:brightness-110"}`}>
                🎲 {isGuess ? "Guess!" : "Just a guess"}
              </button>
              <button onClick={handleSubmit} disabled={!selected || loading}
                className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />Marking…</span> : "Submit Answer"}
              </button>
            </div>
          )}

          {showCorrectBanner && <CorrectBanner />}
          {showFeedbackPanel && <Layer1Feedback feedback={layer1} isCorrect={existingAnswer?.correct ?? false} isGuess={existingAnswer?.flagged_as_guess ?? false} />}
          {submitted && !showCorrectBanner && <MiniNoteWidget questionId={question.id} paperId={paperId} notes={notes} onNoteSaved={updated => setNotes({ ...updated })} />}

          {showFeedbackPanel && !isCurrentStarred && (
            <button onClick={handleToggleStar} className="w-full flex items-center justify-center gap-2 border border-amber-500/25 bg-amber-500/5 text-amber-400/80 text-sm font-semibold py-2.5 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/50 active:scale-[0.98] transition-all">
              <Star className="w-4 h-4" /> Star for teacher review
            </button>
          )}

          {showFeedbackPanel && isCurrentStarred && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400 font-semibold">Starred — in your teacher review PDF</p>
                </div>
                <button onClick={handleToggleStar} className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors shrink-0">Remove</button>
              </div>
              {(showTeacherPrompt || !starredQuestions[question.id]?.teacherQuestion) && (
                <TeacherQuestionInline questionId={question.id} existing={starredQuestions[question.id]?.teacherQuestion ?? ""} onSave={(value) => { handleTeacherQuestionSave(question.id, value); setShowTeacherPrompt(false); }} onSkip={() => setShowTeacherPrompt(false)} />
              )}
              {!showTeacherPrompt && starredQuestions[question.id]?.teacherQuestion && (
                <div className="px-4 pb-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 flex items-center gap-1"><MessageCircleQuestion className="w-3 h-3" /> Question for teacher</p>
                  <p className="text-xs text-foreground/70 leading-relaxed italic">"{starredQuestions[question.id].teacherQuestion}"</p>
                  <button onClick={() => setShowTeacherPrompt(true)} className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors">Edit</button>
                </div>
              )}
            </div>
          )}

          {showFeedbackPanel && !layer2 && (
            <button onClick={handleRequestLayer2} disabled={loadingL2}
              className="w-full flex items-center justify-center gap-2 border border-white/10 bg-white/[0.03] text-muted-foreground text-sm font-semibold py-3 rounded-xl hover:bg-white/[0.06] hover:text-foreground active:scale-[0.98] transition-all disabled:opacity-50">
              {loadingL2 ? <><span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />Loading breakdown…</> : <><ChevronDown className="w-4 h-4" />Show deeper breakdown</>}
            </button>
          )}

          {layer2 && <Layer2Feedback feedback={layer2} />}

          {!showCorrectBanner && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={isFirst}
                className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button onClick={() => currentIdx < questions.length - 1 ? setCurrentIdx(i => i + 1) : navigate("/physics/p1-summary", { state: { answers, questions, paperId: paper.id } })}
                className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
                {isLast ? "Finish" : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Dual scratchpads — only render when there's room (≥130px each side) ── */}
      <ScratchpadPanel questionId={question?.id} paperId={paperId} />

      {showFormulas && <FormulaSheet onClose={() => setShowFormulas(false)} imageUrl={paper.formulaSheetUrl} />}
      {showOverview && <OverviewPanel questions={questions} answers={answers} currentIdx={currentIdx} onJump={setCurrentIdx} onClose={() => setShowOverview(false)} onClear={handleClear} starredIds={starredIds} notedIds={notedIds} />}
      {showStarred && <StarredPanel paperId={paperId} paperLabel={paper.label} paper={paper} starredQuestions={starredQuestions} notes={notes} onClose={() => setShowStarred(false)} onJump={setCurrentIdx} questions={questions} userEmail={user?.email} onTeacherQuestionSave={handleTeacherQuestionSave} />}
    </div>
  );
}