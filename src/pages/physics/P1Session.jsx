import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, Calculator, Grid3X3, ChevronDown, Zap, Microscope, Loader2, Star, Download, Pencil, NotebookPen, MessageCircleQuestion, PenLine, Trash2, Check } from "lucide-react";
import { getP1Paper } from "@/lib/physicsP1Bank";
import { base44 } from "@/api/base44Client";
import ScientificCalculator from "@/components/ScientificCalculator";
import { saveMCQAttempt } from "@/lib/topicStore";
import { loadP1Session, saveP1Session, clearP1Session } from "@/lib/p1SessionStore";
import { loadStarredQuestions, starQuestion, unstarQuestion, saveTeacherQuestion } from "@/lib/p1StarStore";
import { generateStarredPdf } from "@/lib/p1StarPdf";
import { loadNotes, saveNote } from "@/lib/p1NotesStore";
import { generateNotesPdf } from "@/lib/p1NotesPdf";
import { loadScratchpadForPaper } from "@/lib/p1ScratchpadStore";
import { loadWorkings, saveWorking, deleteWorking } from "@/lib/p1WorkingsStore";
import { generateWorkingsPdf } from "@/lib/p1WorkingsPdf";
import PaperPdfButton from "@/components/PaperPdfButton";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import ScratchpadPanel from "@/components/ScratchpadPanel";
import P1OverviewPanel from "@/pages/physics/P1OverviewPanel";
import { useAuth } from "@/lib/AuthContext";
import { FORMULA_SHEET_URL } from "@/lib/physicsP1Bank";

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
          <p className="text-sm font-bold text-white leading-snug relative">{feedback.pulse_layer_1}</p>
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
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
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
            <div className="p-8 text-center text-muted-foreground text-sm">Formula sheet not available for this paper.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StarredPanel({ paperId, paperLabel, paper, starredQuestions, setStarredQuestions, notes, workings, onClose, onJump, questions, userEmail, onTeacherQuestionSave, onDeleteWorking }) {
  const [activeTab, setActiveTab] = useState("notes");
  const [downloading, setDownloading] = useState(false);
  const [downloadingNotes, setDownloadingNotes] = useState(false);
  const [downloadingWorkings, setDownloadingWorkings] = useState(false);
  const [teacherInputs, setTeacherInputs] = useState(() => {
    const init = {};
    Object.entries(starredQuestions).forEach(([id, entry]) => { init[id] = entry.teacherQuestion ?? ""; });
    return init;
  });
  const [editingIds, setEditingIds] = useState(new Set());

  function startEditing(questionId, currentValue) {
    setTeacherInputs(p => ({ ...p, [questionId]: currentValue ?? "" }));
    setEditingIds(prev => new Set([...prev, questionId]));
  }

  function cancelEditing(questionId) {
    setEditingIds(prev => { const n = new Set(prev); n.delete(questionId); return n; });
  }

  function handleUnstar(questionId) {
    const updated = unstarQuestion(paperId, questionId);
    setStarredQuestions({ ...updated });
  }

  const starred = Object.entries(starredQuestions).sort((a, b) => a[1].questionNumber - b[1].questionNumber);
  const noteCount = Object.keys(notes).length;
  const starredCount = starred.length;
  const workingEntries = Object.entries(workings).sort((a, b) => {
    const qa = questions.find(q => q.id === a[0]);
    const qb = questions.find(q => q.id === b[0]);
    return (qa?.number ?? a[1].questionNumber ?? 0) - (qb?.number ?? b[1].questionNumber ?? 0);
  });
  const workingsCount = workingEntries.length;
  const allNotes = Object.entries(notes).sort(([, a], [, b]) => new Date(a.savedAt ?? 0) - new Date(b.savedAt ?? 0));

  function getQuestion(questionId) { return questions.find(q => q.id === questionId); }

  function handleSaveTeacherResponse(questionId, response) {
    const updated = { ...starredQuestions };
    if (updated[questionId]) {
      updated[questionId] = { ...updated[questionId], teacherResponse: response };
      const localKey = `p1_stars_${(paperId ?? "default").replace(/\//g, "_")}`;
      try { localStorage.setItem(localKey, JSON.stringify(updated)); } catch {}
      setStarredQuestions(updated);
    }
  }

  async function handleDownloadStarred() {
    setDownloading(true);
    await generateStarredPdf({ paperId, paperLabel, starredQuestions, userEmail });
    setDownloading(false);
  }

  async function handleDownloadNotes() {
    setDownloadingNotes(true);
    await generateNotesPdf({ paperId, paperLabel, session: paper.session, variant: paper.id?.split("/")?.[1] ?? "", notes, questions, userEmail });
    setDownloadingNotes(false);
  }

  async function handleDownloadWorkings() {
    setDownloadingWorkings(true);
    await generateWorkingsPdf({ paperId, paperLabel, workings, questions, userEmail });
    setDownloadingWorkings(false);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col justify-end items-center">
      <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl flex flex-col" style={{ height: "92vh" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
          <p className="font-bold text-foreground">Notes, Workings & Starred</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="flex shrink-0 border-b border-border/50">
          <button onClick={() => setActiveTab("notes")} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Pencil className="w-3 h-3" /> Notes {noteCount > 0 && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "notes" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>{noteCount}</span>}
          </button>
          <button onClick={() => setActiveTab("workings")} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === "workings" ? "border-blue-400 text-blue-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <PenLine className="w-3 h-3" /> Workings {workingsCount > 0 && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "workings" ? "bg-blue-500/20 text-blue-400" : "bg-secondary text-muted-foreground"}`}>{workingsCount}</span>}
          </button>
          <button onClick={() => setActiveTab("teacher")} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === "teacher" ? "border-amber-400 text-amber-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Star className={`w-3 h-3 ${activeTab === "teacher" ? "fill-amber-400" : ""}`} /> Teacher {starredCount > 0 && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "teacher" ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"}`}>{starredCount}</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {activeTab === "notes" && (
            <>
              {allNotes.length === 0 && <div className="flex flex-col items-center justify-center py-12 gap-3 text-center"><Pencil className="w-8 h-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No notes yet.</p></div>}
              {allNotes.map(([questionId, note]) => {
                const q = getQuestion(questionId);
                return (
                  <div key={questionId} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        {q && <div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-primary">Q{q.number}</span><span className="text-[11px] text-muted-foreground">{q.topic}</span></div>}
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                      </div>
                      {q && <button onClick={() => { const idx = questions.findIndex(qq => qq.id === questionId); if (idx >= 0) { onJump(idx); onClose(); } }} className="text-[11px] font-semibold text-primary shrink-0 px-2 py-1 rounded-lg bg-primary/10 hover:brightness-110 transition-all">Go to →</button>}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {activeTab === "workings" && (
            <>
              {workingEntries.length === 0 && <div className="flex flex-col items-center justify-center py-12 gap-3 text-center"><PenLine className="w-8 h-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No workings saved yet.</p></div>}
              {workingEntries.map(([questionId, entry]) => {
                const q = getQuestion(questionId);
                const qNumber = entry.questionNumber ?? q?.number ?? "?";
                const qTopic = entry.topic ?? q?.topic ?? "";
                const sides = entry.sides ?? {};
                return (
                  <div key={questionId} className="bg-blue-500/5 border border-blue-500/20 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-blue-500/10">
                      <div className="flex items-center gap-2"><PenLine className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span className="font-mono text-xs font-bold text-primary">Q{qNumber}</span><span className="text-[11px] text-muted-foreground">{qTopic}</span></div>
                      <div className="flex items-center gap-2">
                        {q && <button onClick={() => { const idx = questions.findIndex(qq => qq.id === questionId); if (idx >= 0) { onJump(idx); onClose(); } }} className="text-[11px] font-semibold text-primary shrink-0 px-2 py-1 rounded-lg bg-primary/10 hover:brightness-110 transition-all">Go to →</button>}
                        <button onClick={() => onDeleteWorking(questionId)} className="p-1 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      {Object.entries(sides).sort().map(([sideKey, imageData]) => (
                        <div key={sideKey} className="space-y-1">
                          {Object.keys(sides).length > 1 && <p className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-widest">{sideKey} side</p>}
                          <img src={imageData} alt={`Working for Q${qNumber}`} className="w-full rounded-lg border border-blue-500/20" style={{ background: "#f6f1e4", maxHeight: 200, objectFit: "contain" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {activeTab === "teacher" && (
            <>
              {starred.length === 0 && <div className="flex flex-col items-center justify-center py-12 gap-3 text-center"><Star className="w-8 h-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No starred questions yet.</p></div>}
              {starred.map(([questionId, entry]) => (
                <div key={questionId} className="bg-secondary/40 border border-amber-500/20 rounded-xl overflow-hidden">
                  <div className="flex items-start justify-between gap-2 p-4 pb-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" /><span className="font-mono text-xs font-bold text-primary">Q{entry.questionNumber}</span><span className="text-[11px] text-muted-foreground">{entry.topic}</span></div>
                      <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2 pl-5">{entry.questionText}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => { const idx = questions.findIndex(q => q.id === questionId); if (idx >= 0) { onJump(idx); onClose(); } }} className="text-[11px] font-semibold text-primary px-2 py-1 rounded-lg bg-primary/10 hover:brightness-110 transition-all">Go to →</button>
                      <button onClick={() => handleUnstar(questionId)} title="Remove from starred" className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {entry.feedback?.pulse_layer_1 && <div className="mx-4 mb-3 bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-0.5">Exam Takeaway</p><p className="text-[11px] text-foreground/70 leading-relaxed">{entry.feedback.pulse_layer_1}</p></div>}
                  <div className="px-4 pb-3 space-y-1.5 border-b border-amber-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 flex items-center gap-1.5"><MessageCircleQuestion className="w-3 h-3" /> Your question for teacher</p>
                    {entry.teacherQuestion && !editingIds.has(questionId) ? (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] text-foreground/80 leading-relaxed italic flex-1">"{entry.teacherQuestion}"</p>
                        <button onClick={() => startEditing(questionId, entry.teacherQuestion)} className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-amber-500/10">Edit</button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <textarea value={teacherInputs[questionId] ?? ""} onChange={e => setTeacherInputs(p => ({ ...p, [questionId]: e.target.value }))} placeholder="What would you like to ask your teacher?" rows={2} className="w-full bg-card border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
                        <div className="flex items-center justify-between">
                          {entry.teacherQuestion && <button onClick={() => cancelEditing(questionId)} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Cancel</button>}
                          <button onClick={() => { onTeacherQuestionSave(questionId, teacherInputs[questionId] ?? ""); cancelEditing(questionId); }} disabled={!teacherInputs[questionId]?.trim()} className="ml-auto text-xs font-bold text-amber-400 hover:brightness-110 transition-all bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 disabled:opacity-40">Save question →</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /><p className="text-[10px] font-black uppercase tracking-widest text-amber-400">What the teacher said</p></div>
                    <p className="text-[10px] text-muted-foreground/50 leading-snug">Fill in after your teacher reviews — or leave blank to write by hand when printed.</p>
                    <textarea value={entry.teacherResponse ?? ""} onChange={e => handleSaveTeacherResponse(questionId, e.target.value)} placeholder="Type the teacher's response here, or leave blank to fill in by hand when printed…" rows={3} className="w-full bg-card border border-amber-500/20 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all leading-relaxed" />
                    <p className="text-[10px] text-muted-foreground/40">{(entry.teacherResponse ?? "").trim() ? "Typed response will appear as text in the PDF" : "Blank = 5 ruled lines appear in the PDF for handwriting"}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="shrink-0 px-4 py-4 border-t border-border/50 bg-card">
          {activeTab === "notes" && <button onClick={handleDownloadNotes} disabled={noteCount === 0 || downloadingNotes} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40">{downloadingNotes ? <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Generating…</> : <><NotebookPen className="w-4 h-4" />Download My Notes (PDF)</>}</button>}
          {activeTab === "workings" && <button onClick={handleDownloadWorkings} disabled={workingsCount === 0 || downloadingWorkings} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40">{downloadingWorkings ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</> : <><Download className="w-4 h-4" />Download My Workings (PDF)</>}</button>}
          {activeTab === "teacher" && <button onClick={handleDownloadStarred} disabled={starredCount === 0 || downloading} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40">{downloading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Generating…</> : <><Download className="w-4 h-4" />Download Teacher Review (PDF)</>}</button>}
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
  if (!open && !existing?.text) return <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/60 hover:text-green-400 hover:border-green-500/30 border border-border/40 bg-secondary/40 px-3 py-2 rounded-xl transition-all w-full"><Pencil className="w-3.5 h-3.5" /> Add a note</button>;
  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Pencil className="w-3.5 h-3.5 text-green-400" /><p className="text-[11px] font-bold uppercase tracking-widest text-green-400/70">My Note</p></div>{existing?.text && !open && <button onClick={() => setOpen(true)} className="text-[10px] text-green-400/60 hover:text-green-400 transition-colors">Edit</button>}</div>
      {open ? (<><textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="What did you understand? What confused you?" rows={3} autoFocus className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all" /><div className="flex items-center justify-between gap-2"><button onClick={() => { setOpen(false); setText(existing?.text ?? ""); }} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Cancel</button><div className="flex items-center gap-2">{text.trim() && <button onClick={() => { setText(""); saveNote(paperId, questionId, ""); onNoteSaved({}); setOpen(false); }} className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors">Delete note</button>}<button onClick={handleSave} className="text-xs font-bold text-green-400 hover:brightness-110 transition-all bg-green-500/15 px-3 py-1.5 rounded-lg border border-green-500/30">{saved ? "Saved ✓" : "Save note"}</button></div></div><p className="text-[10px] text-muted-foreground/30">Cmd/Ctrl + Enter to save</p></>) : (<p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{existing?.text}</p>)}
    </div>
  );
}

function OptionRow({ optKey, text, selected, crossedOut, submitted, correctOption, onSelect, onToggleCrossOut }) {
  const isCorrectOption = optKey === correctOption;
  const isWrongChosen = submitted && optKey === selected && !isCorrectOption;

  let containerCls = "relative w-full flex items-center gap-2 p-3.5 rounded-xl border text-left transition-all select-none ";
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
      <span className={`font-mono text-xs font-black shrink-0 w-5 text-center transition-colors ${
        submitted && isCorrectOption ? "text-green-400"
        : submitted && isWrongChosen ? "text-red-400"
        : selected === optKey ? "text-primary"
        : crossedOut ? "text-muted-foreground/30"
        : "text-muted-foreground"
      }`}>{optKey}</span>

      <button type="button" disabled={submitted || crossedOut} onClick={() => !submitted && !crossedOut && onSelect(optKey)}
        className={`flex-1 min-w-0 text-left text-sm leading-relaxed transition-all ${crossedOut ? "line-through text-muted-foreground/30 cursor-not-allowed" : "text-foreground/90"}`}
        style={{ background: "none", border: "none", padding: 0 }}>
        {text}
      </button>

      {!submitted && (
        <button type="button" onClick={e => { e.stopPropagation(); onToggleCrossOut(optKey); }}
          title={crossedOut ? "Restore option" : "Cross out — eliminate this option"}
          className={`shrink-0 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
            crossedOut
              ? "w-7 h-7 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
              : "w-7 h-7 bg-secondary/60 border border-border/60 text-muted-foreground/40 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400"
          }`}>
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {submitted && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
      {submitted && isWrongChosen && <X className="w-4 h-4 text-red-400 shrink-0" />}

      {crossedOut && !submitted && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-10 right-10 h-px bg-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

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
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [crossedOut, setCrossedOut] = useState(new Set());
  const [isGuess, setIsGuess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCorrectBanner, setShowCorrectBanner] = useState(false);
  const [layer1, setLayer1] = useState(null);
  const [layer2, setLayer2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLayer2, setLoadingLayer2] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [starredQuestions, setStarredQuestions] = useState({});
  const [notes, setNotes] = useState({});
  const [workings, setWorkings] = useState({});

  const autoAdvanceTimer = useRef(null);

  useEffect(() => {
    if (!paper) { navigate("/physics"); return; }
    setSessionLoading(true);
    Promise.all([
      loadP1Session(paperId),
      loadNotes(paperId),
      loadStarredQuestions(paperId),
      loadWorkings(paperId),
      loadScratchpadForPaper(paperId).catch(() => {}),
    ]).then(([session, loadedNotes, loadedStars, loadedWorkings]) => {
      setAnswers(session.answers ?? {});
      setCurrentIdx(session.currentIdx ?? 0);
      setNotes(loadedNotes ?? {});
      setStarredQuestions(loadedStars ?? {});
      setWorkings(loadedWorkings ?? {});
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

  useEffect(() => { return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); }; }, []);

  useEffect(() => {
    if (sessionLoading) return;
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setCurrentAnswer(existingAnswer?.chosen ?? "");
    setCrossedOut(new Set());
    setIsGuess(false);
    setSubmitted(!!existingAnswer);
    setShowCorrectBanner(false);
    setLayer1(existingAnswer?.layer1 ?? null);
    setLayer2(existingAnswer?.layer2 ?? null);
    setShowCalc(false);
    setLoadingLayer2(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, sessionLoading]);

  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount / questions.length;
  const starredIds = new Set(Object.keys(starredQuestions));
  const notedIds = new Set(Object.keys(notes));
  const isCurrentStarred = question ? starredIds.has(question.id) : false;
  const totalPanelItems = starredIds.size + notedIds.size + Object.keys(workings).length;

  function handleToggleCrossOut(key) {
    if (submitted) return;
    setCrossedOut(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); }
      else { next.add(key); if (currentAnswer === key) setCurrentAnswer(""); }
      return next;
    });
  }

  function handleToggleStar() {
    if (!question) return;
    if (isCurrentStarred) { const updated = unstarQuestion(paperId, question.id); setStarredQuestions({ ...updated }); }
    else { const merged = { ...(layer1 ?? {}), ...(layer2 ?? {}) }; const updated = starQuestion(paperId, question, merged); setStarredQuestions({ ...updated }); }
  }

  function handleTeacherQuestionSave(questionId, value) {
    const updated = saveTeacherQuestion(paperId, questionId, value);
    setStarredQuestions({ ...updated });
  }

  function handleSaveWorking(side, imageData) {
    if (!question) return;
    const updated = saveWorking(paperId, question.id, side, imageData, { questionNumber: question.number, topic: question.topic, questionText: question.text });
    setWorkings({ ...updated });
  }

  function handleDeleteWorking(questionId) {
    const updated = deleteWorking(paperId, questionId);
    setWorkings({ ...updated });
  }

  async function handleClear() {
    await clearP1Session(paperId);
    setAnswers({}); setCurrentIdx(0); setCurrentAnswer(""); setCrossedOut(new Set()); setIsGuess(false); setSubmitted(false);
    setShowCorrectBanner(false); setLayer1(null); setLayer2(null); setShowOverview(false);
  }

  function advanceQuestion() {
    if (currentIdx < questions.length - 1) { setCurrentIdx(i => i + 1); }
    else { navigate("/physics/p1-summary", { state: { answers, questions, paperId: paper.id } }); }
  }

  async function handleSubmit() {
    const selected = currentAnswer;
    if (!selected || loading || submitted) return;
    setLoading(true);
    const isCorrect = selected === question.correct;

    // Always log to MCQ attempt store — with flagged_as_guess if applicable
    await saveMCQAttempt({
      question_id: question.id,
      topic: question.topic,
      source: paper.id,
      chosen_option: selected,
      correct_option: question.correct,
      correct: isCorrect,
      flagged_as_guess: isGuess,
      reasoning: null,
    });

    // Auto-advance ONLY when correct AND not flagged as a guess
    if (isCorrect && !isGuess) {
      const record = { chosen: selected, correct: true, flagged_as_guess: false, layer1: null, layer2: null };
      setAnswers(prev => ({ ...prev, [question.id]: record }));
      setSubmitted(true); setShowCorrectBanner(true); setLoading(false);
      autoAdvanceTimer.current = setTimeout(() => advanceQuestion(), 1500);
      return;
    }

    // For wrong answers OR correct-but-guessed: fetch AI feedback and show it
    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const l1prompt = `Cambridge A Level Physics MCQ. Q${question.number}: ${question.text}\nOptions: ${optionsList}\nCorrect: ${question.correct} (${question.options[question.correct]})\nStudent chose: ${selected}${isGuess ? " — flagged as a GUESS" : " — WRONG"}\nRespond ONLY in JSON:\n{ "marks_earned": 0, "cambridge_insight": "One sentence: why ${question.correct} is the right answer.", "pulse_layer_1": "The reusable exam rule. Max 12 words." }`;

    let fb1 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({ prompt: l1prompt, model: "claude_sonnet_4_6", response_json_schema: { type: "object", properties: { marks_earned: { type: "number" }, cambridge_insight: { type: "string" }, pulse_layer_1: { type: "string" } }, required: ["marks_earned", "cambridge_insight", "pulse_layer_1"] } });
      fb1 = r?.response ?? r;
    } catch {
      fb1 = { marks_earned: 0, cambridge_insight: question.explanation ?? "", pulse_layer_1: question.explanation ?? "" };
    }

    const record = { chosen: selected, correct: isCorrect, flagged_as_guess: isGuess, layer1: fb1, layer2: null };
    setAnswers(prev => ({ ...prev, [question.id]: record }));
    setLayer1(fb1); setLayer2(null); setSubmitted(true); setLoading(false);
  }

  async function handleRequestLayer2() {
    if (loadingLayer2 || layer2) return;
    setLoadingLayer2(true);
    const optionsList = OPTION_KEYS.map(k => `${k}: ${question.options[k]}`).join("\n");
    const l2prompt = `Cambridge A Level Physics MCQ. Q${question.number}: ${question.text}\nOptions: ${optionsList}\nCorrect: ${question.correct} (${question.options[question.correct]})\nStudent chose: ${currentAnswer} — WRONG\nRespond ONLY in JSON:\n{ "step1_system": "One sentence.", "step2_phrase_breakdown": "1-2 sentences.", "step3_tipping_point": "One sentence." }`;
    let fb2 = null;
    try {
      const r = await base44.integrations.Core.InvokeLLM({ prompt: l2prompt, model: "claude_sonnet_4_6", response_json_schema: { type: "object", properties: { step1_system: { type: "string" }, step2_phrase_breakdown: { type: "string" }, step3_tipping_point: { type: "string" } }, required: ["step1_system", "step2_phrase_breakdown", "step3_tipping_point"] } });
      fb2 = r?.response ?? r;
    } catch { fb2 = { step1_system: "Could not load breakdown.", step2_phrase_breakdown: "", step3_tipping_point: "" }; }
    setLayer2(fb2);
    setAnswers(prev => ({ ...prev, [question.id]: { ...prev[question.id], layer2: fb2 } }));
    setLoadingLayer2(false);
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
  const isLast = currentIdx === questions.length - 1;
  const showFeedbackPanel = submitted && layer1 !== null;
  const crossedCount = crossedOut.size;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="w-4 h-4 text-foreground" /></button>
            <div className="flex flex-col items-center"><p className="text-xs font-bold text-foreground">{paper.label}</p><p className="text-[10px] text-muted-foreground">Q{currentIdx + 1} / {questions.length}</p></div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowCalc(c => !c)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${showCalc ? "bg-primary/20 border-primary/50 text-primary" : "bg-secondary border-border text-muted-foreground hover:brightness-110"}`}><Calculator className="w-3.5 h-3.5" /></button>
              <button onClick={() => setShowFormulas(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:brightness-110 transition-all"><BookOpen className="w-3.5 h-3.5" /></button>
              <button onClick={() => setShowStarred(true)} className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${totalPanelItems > 0 ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-secondary border-border text-muted-foreground hover:brightness-110"}`}><NotebookPen className={`w-3.5 h-3.5 ${totalPanelItems > 0 ? "text-amber-400" : ""}`} />{totalPanelItems > 0 && <span className="font-mono text-[10px]">{totalPanelItems}</span>}</button>
              <button onClick={() => setShowOverview(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs font-semibold text-muted-foreground hover:brightness-110 transition-all"><Grid3X3 className="w-3.5 h-3.5" /><span className="font-mono text-[10px]">{answeredCount}/{questions.length}</span></button>
            </div>
          </div>
          <div className="w-full h-0.5 bg-secondary"><div className="h-0.5 bg-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} /></div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-card/40">
          <PaperPdfButton label="Open Question Paper" paperId={paperId} />
          <p className="text-[11px] text-muted-foreground/60 leading-snug">Open the PDF to see diagrams</p>
        </div>

        <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b border-border/30 bg-card/40">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            return (
              <button key={q.id} onClick={() => setCurrentIdx(i)} className={`relative shrink-0 w-6 h-6 rounded-md text-[9px] font-bold border transition-all ${isCurrent ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110" : a?.chosen && a?.correct && !a?.flagged_as_guess ? "bg-green-500/20 border-green-500/40 text-green-400" : a?.chosen && a?.flagged_as_guess ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : a?.chosen && !a?.correct ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-secondary/60 border-border/40 text-muted-foreground/50"}`}>{q.number}</button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">
          {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">Question {question.number}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{question.topic}</span>
                {submitted && (
                  <button onClick={handleToggleStar} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${isCurrentStarred ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-secondary border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"}`}>
                    <Star className={`w-3.5 h-3.5 ${isCurrentStarred ? "fill-amber-400" : ""}`} /><span>{isCurrentStarred ? "Starred" : "Star"}</span>
                  </button>
                )}
              </div>
            </div>
            {question.image_required && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center gap-2.5">
                <span className="text-base shrink-0">📊</span>
                <p className="text-[11px] text-primary/80 leading-snug">This question has a diagram — see <strong>Q{question.number}</strong> in the question paper PDF above</p>
              </div>
            )}
            <QuestionAnnotator text={question.text} questionId={question.id} />
          </div>

          {!submitted && (
            <p className="text-[11px] text-muted-foreground/40 text-center -mt-2">
              Tap ✕ on any option to cross it out{crossedCount > 0 ? ` · ${crossedCount} crossed out` : ""}
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            {OPTION_KEYS.map(key => (
              <OptionRow key={key} optKey={key} text={question.options[key]} selected={currentAnswer} crossedOut={crossedOut.has(key)} submitted={submitted} correctOption={question.correct} onSelect={setCurrentAnswer} onToggleCrossOut={handleToggleCrossOut} />
            ))}
          </div>

          {/* Submit row — "Just a guess" toggle + Submit button */}
          {!submitted && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setIsGuess(g => !g)}
                className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all shrink-0 ${
                  isGuess
                    ? "bg-amber-400 text-amber-900 border-amber-400"
                    : "bg-secondary border-border text-muted-foreground hover:brightness-110"
                }`}
              >
                🎲 {isGuess ? "Guess!" : "Just a guess"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!currentAnswer || loading}
                className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />Marking…</span>
                  : "Submit Answer"}
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

          {showFeedbackPanel && !layer2 && !showCorrectBanner && (
            <button
              onClick={handleRequestLayer2}
              disabled={loadingLayer2}
              className="w-full flex items-center justify-center gap-2 border border-white/10 bg-white/[0.03] text-muted-foreground text-sm font-semibold py-3 rounded-xl hover:bg-white/[0.06] hover:text-foreground active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingLayer2 ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Loading deeper breakdown…</>
              ) : (
                <><ChevronDown className="w-4 h-4" />Show deeper breakdown</>
              )}
            </button>
          )}

          {layer2 && <Layer2Feedback feedback={layer2} />}

          {!showCorrectBanner && (
            <div className="grid grid-cols-2 gap-3 pb-4">
              <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> Previous</button>
              <button onClick={() => currentIdx < questions.length - 1 ? setCurrentIdx(i => i + 1) : navigate("/physics/p1-summary", { state: { answers, questions, paperId: paper.id } })} className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">{isLast ? "Finish" : "Next"} <ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      <ScratchpadPanel questionId={question?.id} paperId={paperId} workings={workings} onSaveWorking={handleSaveWorking} />
      {showFormulas && <FormulaSheet onClose={() => setShowFormulas(false)} imageUrl={paper.formulaSheetUrl} />}
      {showOverview && <P1OverviewPanel questions={questions} answers={answers} currentIdx={currentIdx} onJump={setCurrentIdx} onClose={() => setShowOverview(false)} onClear={handleClear} starredIds={starredIds} notedIds={notedIds} />}
      {showStarred && <StarredPanel paperId={paperId} paperLabel={paper.label} paper={paper} starredQuestions={starredQuestions} setStarredQuestions={setStarredQuestions} notes={notes} workings={workings} onClose={() => setShowStarred(false)} onJump={setCurrentIdx} questions={questions} userEmail={user?.email} onTeacherQuestionSave={handleTeacherQuestionSave} onDeleteWorking={handleDeleteWorking} />}
    </div>
  );
}