import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, Undo2, Eraser, PenLine } from "lucide-react";
import { getStrokesForQuestion, saveStrokes } from "@/lib/p1ScratchpadStore";

const PEN_COLORS = [
  { color: "#0f172a", label: "Black" },
  { color: "#1e3a8a", label: "Blue" },
  { color: "#7f1d1d", label: "Red" },
  { color: "#14532d", label: "Green" },
];

// ── Single pad (one side) ─────────────────────────────────────────────────────

function DrawingPad({ side, questionId, paperId, width }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [activeTool, setActiveTool] = useState("pen");
  const [penColor, setPenColor] = useState("#0f172a");
  const [penSize, setPenSize] = useState(2);
  const [strokes, setStrokes] = useState([]);
  const [hasContent, setHasContent] = useState(false);

  // Refs to avoid stale closures in document listeners
  const strokesRef = useRef([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef([]);
  const activeToolRef = useRef("pen");
  const penColorRef = useRef("#0f172a");
  const penSizeRef = useRef(2);
  const questionIdRef = useRef(questionId);
  const paperIdRef = useRef(paperId);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { penColorRef.current = penColor; }, [penColor]);
  useEffect(() => { penSizeRef.current = penSize; }, [penSize]);
  useEffect(() => { questionIdRef.current = questionId; }, [questionId]);
  useEffect(() => { paperIdRef.current = paperId; }, [paperId]);

  // Load strokes when question changes
  useEffect(() => {
    const s = getStrokesForQuestion(paperId, questionId, side);
    setStrokes(s);
    strokesRef.current = s;
    setHasContent(s.length > 0);
  }, [questionId, paperId, side]);

  // ── Canvas rendering ────────────────────────────────────────────────────────

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

    // Saved strokes
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

    // In-progress stroke
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

    // Eraser cursor preview
    if (eraserPos && activeToolRef.current === "eraser") {
      const R = 14;
      ctx.beginPath();
      ctx.arc(eraserPos.x * W, eraserPos.y * H, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100,100,100,0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Fill slightly
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(eraserPos.x * W, eraserPos.y * H, R, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // Resize canvas when container resizes
  useEffect(() => {
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
  }, [redraw]);

  // Redraw when strokes change
  useEffect(() => { redraw(); }, [strokes, redraw]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getCanvasPos(clientX, clientY) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }

  function commitStroke(pts) {
    if (pts.length < 2) return;
    const newStroke = { points: pts, color: penColorRef.current, size: penSizeRef.current };
    const updated = [...strokesRef.current, newStroke];
    strokesRef.current = updated;
    setStrokes(updated);
    setHasContent(true);
    saveStrokes(paperIdRef.current, questionIdRef.current, side, updated);
  }

  function eraseAt(pos) {
    const R = 0.05; // normalized eraser radius
    const updated = strokesRef.current.filter(
      s => !s.points.some(pt => Math.hypot(pt.x - pos.x, pt.y - pos.y) < R)
    );
    if (updated.length !== strokesRef.current.length) {
      strokesRef.current = updated;
      setStrokes(updated);
      setHasContent(updated.length > 0);
      saveStrokes(paperIdRef.current, questionIdRef.current, side, updated);
    }
  }

  // ── Document-level pointer listeners (so strokes complete outside canvas) ──

  useEffect(() => {
    function onMove(e) {
      if (!isDrawingRef.current) return;
      const src = e.touches ? e.touches[0] : e;
      const pos = getCanvasPos(src.clientX, src.clientY);
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
      }

      currentStrokeRef.current = [];
      redraw();
    }

    document.addEventListener("pointermove", onMove, { passive: true });
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
    const pos = getCanvasPos(src.clientX, src.clientY);
    if (!pos) return;

    if (activeToolRef.current === "pen") {
      currentStrokeRef.current = [pos];
    } else if (activeToolRef.current === "eraser") {
      eraseAt(pos);
      redraw(pos);
    }
  }

  function handleUndo() {
    const updated = strokesRef.current.slice(0, -1);
    strokesRef.current = updated;
    setStrokes(updated);
    setHasContent(updated.length > 0);
    saveStrokes(paperId, questionId, side, updated);
  }

  function handleClear() {
    strokesRef.current = [];
    setStrokes([]);
    setHasContent(false);
    saveStrokes(paperId, questionId, side, []);
  }

  // ── Paper texture ───────────────────────────────────────────────────────────
  // Both pads look like an open notebook page — margin line on the left, ruled lines
  const paperStyle = {
    background: "#f6f1e4",
    backgroundImage: [
      "repeating-linear-gradient(transparent, transparent 26px, #b8c8e0 26px, #b8c8e0 27.5px)",
      "linear-gradient(90deg, transparent 28px, #d9908a 28px, #d9908a 30px, transparent 30px)",
    ].join(", "),
  };

  const borderSide = side === "left"
    ? "border-r border-[#d0c5a8]"
    : "border-l border-[#d0c5a8]";

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
      }}
    >
      {/* ── Header ── */}
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
              disabled={strokes.length === 0}
              title="Undo last stroke"
              className="p-1 rounded hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 disabled:opacity-25 transition-colors"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              title="Clear all"
              className="p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-500 disabled:opacity-25 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-[8.5px] text-stone-400 leading-none italic">
          Stylus / touch pen recommended
        </p>

        {/* Tool controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Pen colours */}
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

          {/* Sizes */}
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

          {/* Eraser */}
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

        {/* Active tool indicator */}
        <p className="text-[8px] text-stone-400 leading-none">
          {activeTool === "eraser" ? "🧹 Eraser active — drag to erase" : "✏ Draw mode"}
        </p>
      </div>

      {/* ── Canvas (paper) ── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={paperStyle}>
        {/* Corner fold decoration */}
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

        {/* Empty state */}
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

// ── Main export — renders both panels only when there's room ──────────────────

export default function ScratchpadPanel({ questionId, paperId }) {
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Need at least 130px per side
  const sideWidth = Math.floor((windowWidth - 540) / 2);
  if (sideWidth < 130 || !questionId) return null;

  return (
    <>
      <DrawingPad side="left" questionId={questionId} paperId={paperId} width={sideWidth} />
      <DrawingPad side="right" questionId={questionId} paperId={paperId} width={sideWidth} />
    </>
  );
}