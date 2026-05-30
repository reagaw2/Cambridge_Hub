import { useState, useRef, useEffect } from "react";
import { X, Pencil, PenLine, Check, Trash2, Save, Download } from "lucide-react";
import { getAllNotes } from "@/lib/questionNotesStore";
import { getWorking, saveWorking, deleteWorking, getAllWorkings } from "@/lib/topicalWorkingsStore";
import { AnimatePresence, motion } from "framer-motion";

// ── Canvas workspace ──────────────────────────────────────────────────────────

function WorkingsCanvas({ questionId }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [hasContent, setHasContent] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);

  // Load existing working when question changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const existing = getWorking(questionId);
    if (existing?.imageData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = existing.imageData;
      setHasContent(true);
    } else {
      setHasContent(false);
    }
    setSaved(false);
  }, [questionId]);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e) {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e);
    setHasContent(true);
    setSaved(false);
  }

  function onPointerMove(e) {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : "#111827";
    ctx.lineWidth = tool === "eraser" ? 24 : 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
  }

  function onPointerUp(e) {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    deleteWorking(questionId);
    setHasContent(false);
    setSaved(false);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!hasContent) return;
    saveWorking(questionId, canvas.toDataURL("image/png"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setTool("pen")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            tool === "pen"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:brightness-110"
          }`}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            tool === "eraser"
              ? "bg-secondary border-foreground/30 text-foreground"
              : "bg-card border-border text-muted-foreground hover:brightness-110"
          }`}
        >
          🧹 Eraser
        </button>
        <button
          onClick={handleClear}
          disabled={!hasContent}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 bg-red-500/10 text-xs font-bold hover:brightness-110 disabled:opacity-30 transition-all"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
        <button
          onClick={handleSave}
          disabled={!hasContent}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 ${
            saved
              ? "bg-green-500/20 border-green-500/40 text-green-400"
              : "bg-primary/15 border-primary/40 text-primary hover:brightness-110"
          }`}
        >
          {saved ? <><Check className="w-3 h-3" /> Saved!</> : <><Save className="w-3 h-3" /> Save working</>}
        </button>
      </div>

      {/* Canvas */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "#ffffff", cursor: tool === "eraser" ? "crosshair" : "default" }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          style={{ width: "100%", height: "auto", display: "block", touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center">
        Draw your working here · Save to keep it · Stylus/finger supported
      </p>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function SessionNotesPanel({
  open,
  onClose,
  allQuestions = [],
  currentIdx = 0,
  onJumpTo,
  subject = "physics",
  userEmail = "",
}) {
  const [activeTab, setActiveTab] = useState("notes");
  const [notesData, setNotesData] = useState({});
  const [workingsCount, setWorkingsCount] = useState(0);
  const [downloadingNotes, setDownloadingNotes] = useState(false);

  // Refresh data whenever panel opens
  useEffect(() => {
    if (!open) return;
    setNotesData(getAllNotes());
    const allW = getAllWorkings();
    const count = allQuestions.filter(q => allW[q.id]?.imageData).length;
    setWorkingsCount(count);
  }, [open, allQuestions]);

  const currentQuestion = allQuestions[currentIdx] ?? null;

  // Notes for questions in this session only
  const sessionNotes = allQuestions
    .map((q, i) => ({ q, i, note: notesData[q.id] }))
    .filter(({ note }) => note?.text?.trim());

  const notesCount = sessionNotes.length;

  async function handleDownloadNotes() {
    setDownloadingNotes(true);
    try {
      const { generateNotesPdf } = await import("@/lib/generatePdf");
      const notesMap = {};
      sessionNotes.forEach(({ q, note }) => { notesMap[q.id] = note; });
      const questionsForPdf = allQuestions.map((q, i) => ({
        id: q.id,
        question_text: q.text ?? q.question_text ?? "",
        topic: q.topic ?? "",
        number: i + 1,
        mark_scheme: q.mark_scheme ?? "",
      }));
      await generateNotesPdf({
        paperId: "topical",
        paperLabel: subject === "physics" ? "Physics Practice" : "CS Practice",
        notes: notesMap,
        questions: questionsForPdf,
        userEmail,
      });
    } catch (e) {
      console.error("[SessionNotesPanel] PDF error:", e);
    }
    setDownloadingNotes(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl flex flex-col"
              style={{ height: "88vh" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
                <p className="font-bold text-foreground">Notes, Workings & Starred</p>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex shrink-0 border-b border-border/50">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                    activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  Notes
                  {notesCount > 0 && (
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "notes" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {notesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("workings")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                    activeTab === "workings" ? "border-blue-400 text-blue-400" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PenLine className="w-3 h-3" />
                  Workings
                  {workingsCount > 0 && (
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "workings" ? "bg-blue-500/20 text-blue-400" : "bg-secondary text-muted-foreground"}`}>
                      {workingsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

                {/* ── NOTES TAB ── */}
                {activeTab === "notes" && (
                  <>
                    {sessionNotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <Pencil className="w-8 h-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No notes yet.</p>
                        <p className="text-xs text-muted-foreground/50 max-w-[260px] leading-relaxed">
                          Tap the sticky note icon (✎) in the header to take notes on any question.
                        </p>
                      </div>
                    ) : (
                      sessionNotes.map(({ q, i, note }) => (
                        <div key={q.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-primary">Q{i + 1}</span>
                                <span className="text-[11px] text-muted-foreground">{q.topic ?? ""}</span>
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                            </div>
                            <button
                              onClick={() => { onJumpTo?.(i); onClose(); }}
                              className="text-[11px] font-semibold text-primary shrink-0 px-2 py-1 rounded-lg bg-primary/10 hover:brightness-110 transition-all"
                            >
                              Go to →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* ── WORKINGS TAB ── */}
                {activeTab === "workings" && (
                  <>
                    {currentQuestion ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                            Q{currentIdx + 1}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{currentQuestion.topic ?? ""}</span>
                          <span className="text-[10px] text-muted-foreground/40 ml-auto">
                            Working for current question
                          </span>
                        </div>
                        <WorkingsCanvas
                          questionId={currentQuestion.id}
                          key={currentQuestion.id}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <PenLine className="w-8 h-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No question selected.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {activeTab === "notes" && (
                <div className="shrink-0 px-4 py-4 border-t border-border/50 bg-card">
                  <button
                    onClick={handleDownloadNotes}
                    disabled={notesCount === 0 || downloadingNotes}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {downloadingNotes
                      ? <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Generating…</>
                      : <><Download className="w-4 h-4" /> Download My Notes (PDF)</>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}