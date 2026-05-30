import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, Undo2, Eraser, PenLine, ChevronLeft, ChevronRight, Save, CheckCircle2 } from "lucide-react";
import { getStrokesForQuestion, saveStrokes } from "@/lib/p1ScratchpadStore";

const PEN_COLORS = [
  { color: "#0f172a", label: "Black" },
  { color: "#1e3a8a", label: "Blue" },
  { color: "#7f1d1d", label: "Red" },
  { color: "#14532d", label: "Green" },
];

// ── Single pad ────────────────────────────────────────────────────────────────

function DrawingPad({ side, questionId, paperId, width, onSaveWorking, hasSavedWorking }) {
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
  const paperIdRef = useRef(paperId);
  const eraseSnapshotRef = useRef(null);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { penColorRef.current = penColor; }, [penColor]);
  useEffect(() => { penSizeRef.current = penSize; }, [penSize]);
  useEffect(() => { questionIdRef.current = questionId; }, [questionId]);
  useEffect(() => { paperIdRef.current = paperId; }, [paperId]);

  useEffect(() => {
    const s = getStrokesForQuestion(paperId, questionId, side);
    setStrokes(s);
    strokesRef.current = s;
    setHistory([]);
    historyRef.current = [];
  }, [questionId, paperId, side]);

  function pushHistory(currentStrokes) {
    const snapshot = [...currentStrokes];
    historyRef.current = [...historyRef.current, snapshot];
    setHistory([...historyRef.current]);
  }

  function applyStrokes(newStrokes) {
    strokesRef.current = newStrokes;
    setStrokes(newStrokes);
    saveStrokes(paperIdRef.current, questionIdRef.current, side, newStrokes);
  }

  const redraw = useCallback((eraserPos = null) => {
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

    // Paper background
    ctx.fillStyle = "#f6f1e4";
    ctx.fillRect(0, 0, W, H);

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
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

    if (eraserPos && activeToolRef.current === "eraser") {
      const R = 14;
      ctx.beginPath();
      ctx.arc(eraserPos.x * W, eraserPos.y * H, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100,100,100,0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(eraserPos.x * W, eraserPos.y * H, R, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

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
        redraw();
      });
    };

    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [redraw, collapsed]);

  useEffect(() => { redraw(); }, [strokes, redraw]);

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
      s => !s.points.some(pt => Math.hypot(pt.x - pos.x, pt.y - pos.y) < R)
    );
    if (updated.length !== strokesRef.current.length) {
      strokesRef.current = updated;
      setStrokes(updated);
    }
  }

  useEffect(() => {
    function onMove(e) {
      if (!isDrawingRef.current) return;
      const src = e.touches ? e.touches[0] : e;
      const pos = getCanvasPos(src);
      if (!pos) return;
      if (activeToolRef.current === "pen") {
        currentStrokeRef.current.push(pos);
        redraw();
      } else if (activeToolRef.current === "eraser") {
        eraseAt(pos);
        redraw(pos);
      }
    }

    function onUp() {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (activeToolRef.current === "pen") {
        commitStroke([...currentStrokeRef.current]);
        currentStrokeRef.current = [];
        redraw();
      } else if (activeToolRef.current === "eraser") {
        const current = strokesRef.current;
        if (eraseSnapshotRef.current && eraseSnapshotRef.current.length !== current.length) {
          pushHistory(eraseSnapshotRef.current);
          saveStrokes(paperIdRef.current, questionIdRef.current, side, current);
          setStrokes([...current]);
        }
        eraseSnapshotRef.current = null;
        redraw();
      }
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redraw]);

  function onCanvasDown(e) {
    e.preventDefault();
    isDrawingRef.current = true;
    const src = e.touches ? e.touches[0] : e;
    const pos = getCanvasPos(src);
    if (!pos) return;
    if (activeToolRef.current === "pen") {
      currentStrokeRef.current = [pos];
    } else if (activeToolRef.current === "eraser") {
      eraseSnapshotRef.current = [...strokesRef.current];
      eraseAt(pos);
      redraw(pos);
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

  /**
   * Capture the working by rendering strokes to an offscreen canvas at
   * a fixed output width. Using a separate offscreen canvas ensures the
   * output is clean and resolution-independent.
   */
  function captureCanvas() {
    if (strokesRef.current.length === 0) return null;

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;

    const OUT_W = 600;
    const OUT_H = Math.max(1, Math.round((rect.height / rect.width) * OUT_W));

    const offscreen = document.createElement("canvas");
    offscreen.width = OUT_W;
    offscreen.height = OUT_H;
    const ctx = offscreen.getContext("2d");

    // Paper background
    ctx.fillStyle = "#f6f1e4";
    ctx.fillRect(0, 0, OUT_W, OUT_H);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokesRef.current) {
      if (!stroke.points || stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color ?? "#0f172a";
      ctx.lineWidth = (stroke.size ?? 2) * (OUT_W / rect.width);
      stroke.points.forEach((pt, i) => {
        const x = pt.x * OUT_W;
        const y = pt.y * OUT_H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    return offscreen.toDataURL("image/png");
  }

  function handleSaveWorking() {
    const imageData = captureCanvas();
    if (!imageData) return;
    onSaveWorking?.(imageData);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2500);
  }

  const hasContent = strokes.length > 0;
  const canUndo = history.length > 0;

  const borderSide = side === "left" ? "border-r border-[#d0c5a8]" : "border-l border-[#d0c5a8]";

  if (collapsed) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${borderSide}`}
        style={{
          position: "fixed",
          [side]: 0,
          top: 0,
          bottom: 64,
          width: 28,
          zIndex: 5,
          background: "#ebe4d0",
          cursor: "pointer",
          transition: "width 0.25s ease",
        }}
        onClick={() => setCollapsed(false)}
        title="Expand scratchpad"
      >
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-2 select-none">
          <div
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: side === "left" ? "rotate(180deg)" : "none",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#a89880",
              textTransform: "uppercase",
              userSelect: "none",
            }}
          >
            Workings
          </div>
          {hasContent && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a89880" }} />
          )}
          {hasSavedWorking && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} title="Working saved" />
          )}
        </div>
        <div className="pb-4">
          {side === "left"
            ? <ChevronRight className="w-3.5 h-3.5" style={{ color: "#a89880" }} />
            : <ChevronLeft className="w-3.5 h-3.5" style={{ color: "#a89880" }} />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${borderSide}`}
      style={{
        position: "fixed",
        [side]: 0,
        top: 0,
        bottom: 64,
        width,
        zIndex: 5,
        transition: "width 0.25s ease",
      }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-2 pt-2 pb-2 space-y-1.5"
        style={{ background: "#ebe4d0", borderBottom: "1px solid #c8b89a" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <PenLine className="w-3 h-3 text-stone-500" />
            <p className="text-[10px] font-black text-stone-600 uppercase tracking-widest leading-none">
              Workings
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              title={`Undo (${history.length} step${history.length !== 1 ? "s" : ""} available)`}
              className="p-1 rounded hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 disabled:opacity-25 transition-colors"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleClear}
              disabled={!hasContent}
              title="Clear all (undoable)"
              className="p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-500 disabled:opacity-25 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse scratchpad"
              className="p-1 rounded hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition-colors"
            >
              {side === "left"
                ? <ChevronLeft className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <p className="text-[8.5px] text-stone-400 leading-none italic">
          {canUndo
            ? `${history.length} undo step${history.length !== 1 ? "s" : ""} available`
            : "Stylus / touch pen recommended"}
        </p>

        {/* Tool controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex gap-0.5 items-center">
            {PEN_COLORS.map(({ color, label }) => (
              <button
                key={color}
                title={label}
                onClick={() => { setPenColor(color); setActiveTool("pen"); }}
                className="rounded-full border-[2px] transition-all shrink-0"
                style={{
                  width: 11,
                  height: 11,
                  background: color,
                  borderColor: activeTool === "pen" && penColor === color ? "#6b7280" : "transparent",
                  transform: activeTool === "pen" && penColor === color ? "scale(1.35)" : "scale(1)",
                  boxShadow: activeTool === "pen" && penColor === color ? "0 0 0 1px #fff" : "none",
                }}
              />
            ))}
          </div>

          <div className="w-px h-3 bg-stone-300" />

          <div className="flex gap-0.5 items-center">
            {[{ s: 1.5, label: "Fine" }, { s: 3.5, label: "Thick" }].map(({ s, label }) => (
              <button
                key={s}
                title={label}
                onClick={() => { setPenSize(s); setActiveTool("pen"); }}
                className="rounded-full border flex items-center justify-center transition-all"
                style={{
                  width: 14,
                  height: 14,
                  background: activeTool === "pen" && penSize === s ? "#78716c" : "#e5dece",
                  borderColor: activeTool === "pen" && penSize === s ? "#78716c" : "#b8a888",
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: s + 2,
                    height: s + 2,
                    background: activeTool === "pen" && penSize === s ? "#f6f1e4" : "#78716c",
                  }}
                />
              </button>
            ))}
          </div>

          <div className="w-px h-3 bg-stone-300" />

          <button
            onClick={() => setActiveTool(t => t === "eraser" ? "pen" : "eraser")}
            title={activeTool === "eraser" ? "Switch to pen" : "Eraser"}
            className="flex items-center justify-center rounded border transition-all px-1"
            style={{
              height: 16,
              background: activeTool === "eraser" ? "#78716c" : "#e5dece",
              borderColor: activeTool === "eraser" ? "#78716c" : "#b8a888",
            }}
          >
            <Eraser
              className="w-2.5 h-2.5"
              style={{ color: activeTool === "eraser" ? "#f6f1e4" : "#78716c" }}
            />
          </button>
        </div>

        {/* Save working button */}
        <button
          onClick={handleSaveWorking}
          disabled={!hasContent}
          title="Save working for teacher submission / PDF export"
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border transition-all py-1.5 text-[10px] font-bold disabled:opacity-30"
          style={{
            background: saveFlash || hasSavedWorking ? "#dcfce7" : "#e5dece",
            borderColor: saveFlash || hasSavedWorking ? "#86efac" : "#b8a888",
            color: saveFlash || hasSavedWorking ? "#15803d" : "#78716c",
          }}
        >
          {saveFlash ? (
            <><CheckCircle2 className="w-3 h-3" /> Saved!</>
          ) : hasSavedWorking ? (
            <><CheckCircle2 className="w-3 h-3" /> Working saved</>
          ) : (
            <><Save className="w-3 h-3" /> Save working</>
          )}
        </button>

        <p className="text-[8px] text-stone-400 leading-none">
          {activeTool === "eraser" ? "🧹 Eraser active" : "✏ Draw mode"}
        </p>
      </div>

      {/* Canvas (paper) */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: "#f6f1e4",
          backgroundImage: [
            "repeating-linear-gradient(transparent, transparent 26px, #b8c8e0 26px, #b8c8e0 27.5px)",
            "linear-gradient(90deg, transparent 28px, #d9908a 28px, #d9908a 30px, transparent 30px)",
          ].join(", "),
        }}
      >
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 16,
            height: 16,
            background: "linear-gradient(225deg, #d4c9aa 50%, transparent 50%)",
            opacity: 0.6,
          }}
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{
            touchAction: "none",
            cursor: activeTool === "eraser" ? "cell" : "crosshair",
            width: "100%",
            height: "100%",
          }}
          onPointerDown={onCanvasDown}
          onTouchStart={onCanvasDown}
        />

        {!hasContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none select-none">
            <PenLine className="w-5 h-5 text-stone-300" />
            <p className="text-[9px] text-stone-300 text-center leading-relaxed px-2">
              Write calculations<br />& workings here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 flex items-center justify-center py-1"
        style={{ background: "#ebe4d0", borderTop: "1px solid #c8b89a" }}
      >
        <p className="text-[8px] text-stone-400">scratch paper</p>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ScratchpadPanel({ questionId, paperId, workings, onSaveWorking }) {
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const sideWidth = Math.floor((windowWidth - 540) / 2);
  if (sideWidth < 130 || !questionId) return null;

  const savedSides = workings?.[questionId]?.sides ?? {};

  return (
    <>
      <DrawingPad
        side="left"
        questionId={questionId}
        paperId={paperId}
        width={sideWidth}
        onSaveWorking={(imageData) => onSaveWorking?.("left", imageData)}
        hasSavedWorking={!!savedSides.left}
      />
      <DrawingPad
        side="right"
        questionId={questionId}
        paperId={paperId}
        width={sideWidth}
        onSaveWorking={(imageData) => onSaveWorking?.("right", imageData)}
        hasSavedWorking={!!savedSides.right}
      />
    </>
  );
}