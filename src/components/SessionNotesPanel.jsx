import { useState, useRef, useEffect } from "react";
import { X, Pencil, PenLine, Check, Trash2, Save, Download, Star, MessageCircleQuestion } from "lucide-react";
import { getAllNotes } from "@/lib/questionNotesStore";
import { saveNote } from "@/lib/questionNotesStore";
import { getWorking, saveWorking as saveTopicalWorking, deleteWorking, getAllWorkings } from "@/lib/topicalWorkingsStore";
import { getAllStarred, saveTeacherQuestion, unstarQuestion } from "@/lib/writtenStarStore";
import { AnimatePresence, motion } from "framer-motion";

function WorkingsCanvas({ questionId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [collapsed, setCollapsed] = useState(true);
  const [activeTool, setActiveTool] = useState("pen");
  const [penColor, setPenColor] = useState("#0f172a");
  const [penSize, setPenSize] = useState(2);
  const [strokes, setStrokes] = useState([]);
  const [history, setHistory] = useState([]);
  const [saveFlash, setSaveFlash] = useState(false);

  const strokesRef = useRef([]);
  const historyRef = useRef([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef([]);
  const activeToolRef = useRef("pen");
  const penColorRef = useRef("#0f172a");
  const penSizeRef = useRef(2);
  const questionIdRef = useRef(questionId);
  const eraseSnapshotRef = useRef(null);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { penColorRef.current = penColor; }, [penColor]);
  useEffect(() => { penSizeRef.current = penSize; }, [penSize]);
  useEffect(() => { questionIdRef.current = questionId; }, [questionId]);

  useEffect(() => {
    const s = getWorking(questionId)?.strokes ?? getWorking(questionId) ?? [];
    const safeStrokes = Array.isArray(s) ? s : [];
    setStrokes(safeStrokes);
    strokesRef.current = safeStrokes;
    setHistory([]);
    historyRef.current = [];
  }, [questionId]);

  function pushHistory(currentStrokes) {
    const snapshot = [...currentStrokes];
    historyRef.current = [...historyRef.current, snapshot];
    setHistory([...historyRef.current]);
  }

  function applyStrokes(newStrokes) {
    strokesRef.current = newStrokes;
    setStrokes(newStrokes);
    saveTopicalWorking(questionId, newStrokes);
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "#f6f1e4";
    ctx.fillRect(0, 0, W, H);

    for (const stroke of strokesRef.current) {
      if (!stroke?.points || stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color ?? "#0f172a";
      ctx.lineWidth = stroke.size ?? 2;
      stroke.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x * W, pt.y * H);
        else ctx.lineTo(pt.x * W, pt.y * H);
      });
      ctx.stroke();
    }

    if (activeToolRef.current === "pen" && currentStrokeRef.current.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = penColorRef.current;
      ctx.lineWidth = penSizeRef.current;
      currentStrokeRef.current.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x * W, pt.y * H);
        else ctx.lineTo(pt.x * W, pt.y * H);
      });
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (collapsed) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let raf;
    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        redrawCanvas();
      });
    };

    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [collapsed, questionId]);

  useEffect(() => { redrawCanvas(); }, [strokes]);

  function getCanvasPos(e) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function commitStroke(pts) {
    if (pts.length < 2) return;
    const newStroke = { points: pts, color: penColorRef.current, size: penSizeRef.current };
    pushHistory([...strokesRef.current]);
    applyStrokes([...strokesRef.current, newStroke]);
  }

  function eraseAt(pos) {
    const R = 0.05;
    const updated = strokesRef.current.filter(
      s => !s?.points?.some(pt => Math.hypot(pt.x - pos.x, pt.y - pos.y) < R)
    );
    if (updated.length !== strokesRef.current.length) {
      strokesRef.current = updated;
      setStrokes(updated);
    }
  }

  useEffect(() => {
    function onMove(e) {
      if (!isDrawingRef.current) return;
      const pos = getCanvasPos(e.touches ? e.touches[0] : e);
      if (!pos) return;
      if (activeToolRef.current === "pen") {
        currentStrokeRef.current.push(pos);
        redrawCanvas();
      } else if (activeToolRef.current === "eraser") {
        eraseAt(pos);
        redrawCanvas();
      }
    }

    function onUp() {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (activeToolRef.current === "pen") {
        commitStroke([...currentStrokeRef.current]);
        currentStrokeRef.current = [];
        redrawCanvas();
      } else if (activeToolRef.current === "eraser") {
        const current = strokesRef.current;
        if (eraseSnapshotRef.current && eraseSnapshotRef.current.length !== current.length) {
          pushHistory(eraseSnapshotRef.current);
          saveTopicalWorking(questionIdRef.current, current);
          setStrokes([...current]);
        }
        eraseSnapshotRef.current = null;
        redrawCanvas();
      }
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  function onCanvasDown(e) {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getCanvasPos(e.touches ? e.touches[0] : e);
    if (!pos) return;
    if (activeToolRef.current === "pen") {
      currentStrokeRef.current = [pos];
    } else if (activeToolRef.current === "eraser") {
      eraseSnapshotRef.current = [...strokesRef.current];
      eraseAt(pos);
      redrawCanvas();
    }
  }

  function handleUndo() {
    if (historyRef.current.length === 0) return;
    const prev = [...historyRef.current];
    const snapshot = prev.pop();
    historyRef.current = prev;
    setHistory([...prev]);
    applyStrokes(snapshot);
  }

  function handleClear() {
    if (strokesRef.current.length === 0) return;
    pushHistory([...strokesRef.current]);
    applyStrokes([]);
  }

  const hasContent = strokes.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {["pen", "eraser"].map(t => (
          <button key={t} onClick={() => setActiveTool(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeTool === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:brightness-110"}`}>
            {t === "pen" ? "✏️ Pen" : "🧹 Eraser"}
          </button>
        ))}
        <button onClick={handleClear} disabled={!hasContent}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 bg-red-500/10 text-xs font-bold hover:brightness-110 disabled:opacity-30 transition-all">
          <Trash2 className="w-3 h-3" /> Clear
        </button>
        <button onClick={handleUndo} disabled={history.length === 0}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:brightness-110 disabled:opacity-30 transition-all">
          Undo
        </button>
      </div>
      <div ref={containerRef} className="rounded-xl border border-border overflow-hidden" style={{ background: "#f6f1e4", height: 240 }}>
        <canvas ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
          onPointerDown={onCanvasDown}
          onTouchStart={onCanvasDown}
        />
      </div>
    </div>
  );
}

/**
 * StarredEntryCard — one starred question in the teacher panel.
 * Fixed: Edit button uses local state (no destructive clear), Cancel button added.
 */
function StarredEntryCard({ entry, subject, onUnstar, onSaveTeacherQ }) {
  const [teacherQ, setTeacherQ] = useState(entry.teacherQuestion ?? "");
  // Start in view mode if there's already a question, otherwise edit mode
  const [editing, setEditing] = useState(!entry.teacherQuestion);
  const [saved, setSaved] = useState(false);

  function handleEdit() {
    setTeacherQ(entry.teacherQuestion ?? "");
    setEditing(true);
  }

  function handleCancel() {
    setTeacherQ(entry.teacherQuestion ?? "");
    setEditing(false);
  }

  function handleSave() {
    if (!teacherQ.trim()) return;
    onSaveTeacherQ(entry.questionId, teacherQ);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl overflow-hidden">
      {/* Header: topic + X button to unstar */}
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-[11px] text-muted-foreground">{entry.topic}</span>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2 pl-5">{entry.questionText}</p>
        </div>
        {/* Unstar button — deletes from starred without navigating to the question */}
        <button
          onClick={() => onUnstar(entry.questionId)}
          title="Remove star"
          className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AI takeaway */}
      {entry.feedback?.pulse_layer_1 && (
        <div className="mx-4 mb-2 bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-0.5">Exam Takeaway</p>
          <p className="text-[11px] text-foreground/70 leading-relaxed">{entry.feedback.pulse_layer_1}</p>
        </div>
      )}

      {/* Teacher question section */}
      <div className="px-4 pb-3 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 flex items-center gap-1.5">
          <MessageCircleQuestion className="w-3 h-3" /> Your question for teacher
        </p>

        {/* View mode: question saved and not currently editing */}
        {entry.teacherQuestion && !editing ? (
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] text-foreground/80 leading-relaxed italic flex-1">
              "{saved ? teacherQ : entry.teacherQuestion}"
            </p>
            <button
              onClick={handleEdit}
              className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors shrink-0 px-2 py-0.5 rounded hover:bg-amber-500/10">
              Edit
            </button>
          </div>
        ) : (
          /* Edit / add mode */
          <div className="space-y-1.5">
            <textarea
              value={teacherQ}
              onChange={e => { setTeacherQ(e.target.value); setSaved(false); }}
              placeholder="What would you like to ask your teacher?"
              rows={2}
              className="w-full bg-card border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
            />
            <div className="flex items-center justify-between gap-2">
              {/* Cancel only shown if there was previously a saved question */}
              {entry.teacherQuestion ? (
                <button
                  onClick={handleCancel}
                  className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  Cancel
                </button>
              ) : <span />}
              <button
                onClick={handleSave}
                disabled={!teacherQ.trim()}
                className="ml-auto text-xs font-bold text-amber-400 hover:brightness-110 transition-all bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 disabled:opacity-40">
                {saved ? "Saved ✓" : "Save question →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionNotesPanel({
  open, onClose, allQuestions = [], currentIdx = 0, onJumpTo,
  subject = "physics", userEmail = "",
}) {
  const [activeTab, setActiveTab] = useState("notes");
  const [notesData, setNotesData] = useState({});
  const [workingsCount, setWorkingsCount] = useState(0);
  const [starredData, setStarredData] = useState([]);
  const [downloadingNotes, setDownloadingNotes] = useState(false);
  const [downloadingStarred, setDownloadingStarred] = useState(false);

  const sessionQuestionIds = new Set(allQuestions.map(q => q.id));

  useEffect(() => {
    if (!open) return;
    setNotesData(getAllNotes());
    const allW = getAllWorkings();
    setWorkingsCount(allQuestions.filter(q => allW[q.id]?.imageData).length);
    const allStarred = getAllStarred(subject);
    setStarredData(allStarred.filter(e => sessionQuestionIds.has(e.questionId)));
  }, [open, allQuestions, subject]);

  const currentQuestion = allQuestions[currentIdx] ?? null;

  const sessionNotes = allQuestions
    .map((q, i) => ({ q, i, note: notesData[q.id] }))
    .filter(({ note }) => note?.text?.trim());
  const notesCount = sessionNotes.length;
  const starredCount = starredData.length;

  function handleUnstar(questionId) {
    unstarQuestion(questionId, subject);
    setStarredData(prev => prev.filter(e => e.questionId !== questionId));
  }

  function handleSaveTeacherQ(questionId, teacherQuestion) {
    saveTeacherQuestion(questionId, teacherQuestion, subject);
    setStarredData(prev => prev.map(e => e.questionId === questionId ? { ...e, teacherQuestion } : e));
  }

  async function handleDownloadNotes() {
    setDownloadingNotes(true);
    try {
      const { generateNotesPdf } = await import("@/lib/p1NotesPdf");
      const notesMap = {};
      sessionNotes.forEach(({ q, note }) => { notesMap[q.id] = note; });
      const questionsForPdf = allQuestions.map((q, i) => ({
        id: q.id, question_text: q.text ?? q.question_text ?? "", topic: q.topic ?? "", number: i + 1, mark_scheme: q.mark_scheme ?? ""
      }));
      await generateNotesPdf({ paperId: "topical", paperLabel: subject === "physics" ? "Physics Practice" : "CS Practice", notes: notesMap, questions: questionsForPdf, userEmail });
    } catch (e) { console.error(e); }
    setDownloadingNotes(false);
  }

  async function handleDownloadStarred() {
    setDownloadingStarred(true);
    try {
      const { generateStarredPdf } = await import("@/lib/p1StarPdf");
      const starredForPdf = {};
      starredData.forEach((entry, i) => {
        starredForPdf[entry.questionId] = { ...entry, questionNumber: i + 1, correctAnswer: null, options: null };
      });
      await generateStarredPdf({
        paperId: "written",
        displayName: subject === "physics" ? "Physics Written Practice" : "CS Written Practice",
        userEmail,
        starredQuestions: starredForPdf,
      });
    } catch (e) { console.error(e); }
    setDownloadingStarred(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}>
            <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl flex flex-col" style={{ height: "88vh" }}>

              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
                <p className="font-bold text-foreground">Notes, Workings & Starred</p>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex shrink-0 border-b border-border/50">
                <button onClick={() => setActiveTab("notes")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Pencil className="w-3 h-3" /> Notes
                  {notesCount > 0 && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "notes" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>{notesCount}</span>}
                </button>
                <button onClick={() => setActiveTab("workings")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === "workings" ? "border-blue-400 text-blue-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <PenLine className="w-3 h-3" /> Workings
                  {workingsCount > 0 && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "workings" ? "bg-blue-500/20 text-blue-400" : "bg-secondary text-muted-foreground"}`}>{workingsCount}</span>}
                </button>
                <button onClick={() => setActiveTab("starred")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === "starred" ? "border-amber-400 text-amber-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Star className={`w-3 h-3 ${activeTab === "starred" ? "fill-amber-400" : ""}`} /> Starred
                  {starredCount > 0 && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "starred" ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"}`}>{starredCount}</span>}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

                {/* ── NOTES TAB ── */}
                {activeTab === "notes" && (
                  <>
                    {sessionNotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <Pencil className="w-8 h-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No notes for this topic yet.</p>
                        <p className="text-xs text-muted-foreground/50 max-w-[260px] leading-relaxed">Tap MY NOTE on the feedback page to take notes on a question.</p>
                      </div>
                    ) : sessionNotes.map(({ q, i, note }) => {
                      const qIdx = allQuestions.findIndex(aq => aq.id === q.id);
                      return (
                        <div key={q.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-primary">Q{i + 1}</span>
                                <span className="text-[11px] text-muted-foreground">{q.topic ?? ""}</span>
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                            </div>
                            {qIdx >= 0 && (
                              <button onClick={() => { onJumpTo?.(qIdx); onClose(); }}
                                className="text-[11px] font-semibold text-primary shrink-0 px-2 py-1 rounded-lg bg-primary/10 hover:brightness-110 transition-all">
                                Go to →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ── WORKINGS TAB ── */}
                {activeTab === "workings" && (
                  currentQuestion ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">Q{currentIdx + 1}</span>
                        <span className="text-[11px] text-muted-foreground">{currentQuestion.topic ?? ""}</span>
                        <span className="text-[10px] text-muted-foreground/40 ml-auto">Working for current question</span>
                      </div>
                      <WorkingsCanvas questionId={currentQuestion.id} key={currentQuestion.id} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                      <PenLine className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No question selected.</p>
                    </div>
                  )
                )}

                {/* ── STARRED TAB ── */}
                {activeTab === "starred" && (
                  starredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                      <Star className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No starred questions for this topic yet.</p>
                      <p className="text-xs text-muted-foreground/50 max-w-[260px] leading-relaxed">Tap ☆ Star on the feedback page to flag questions for your teacher.</p>
                    </div>
                  ) : starredData.map((entry) => (
                    <StarredEntryCard
                      key={entry.questionId}
                      entry={entry}
                      subject={subject}
                      onUnstar={handleUnstar}
                      onSaveTeacherQ={handleSaveTeacherQ}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 px-4 py-4 border-t border-border/50 bg-card">
                {activeTab === "notes" && (
                  <button onClick={handleDownloadNotes} disabled={notesCount === 0 || downloadingNotes}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40">
                    {downloadingNotes
                      ? <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Generating…</>
                      : <><Download className="w-4 h-4" />Download My Notes (PDF)</>}
                  </button>
                )}
                {activeTab === "workings" && (
                  <p className="text-[11px] text-muted-foreground/50 text-center">Workings are saved automatically per question</p>
                )}
                {activeTab === "starred" && (
                  <button onClick={handleDownloadStarred} disabled={starredCount === 0 || downloadingStarred}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40">
                    {downloadingStarred
                      ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Generating…</>
                      : <><Download className="w-4 h-4" />Download Teacher Review (PDF)</>}
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}