import { useRef, useEffect, useCallback, useState } from "react";
import { Trash2, Undo2, PenLine, X, ChevronRight, ChevronLeft } from "lucide-react";

const PEN_COLORS = [
  { color: "#1a1008", label: "Black" },
  { color: "#1a3a8a", label: "Blue" },
  { color: "#8a1a1a", label: "Red" },
  { color: "#1a5a1a", label: "Green" },
];

const PEN_SIZES = [
  { size: 1.5, label: "Fine" },
  { size: 2.5, label: "Medium" },
  { size: 4, label: "Thick" },
];

export default function ScratchpadPanel({ isOpen, onToggle }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const strokesRef = useRef([]); // all committed strokes
  const currentStrokeRef = useRef([]); // points in current stroke

  const [penColor, setPenColor] = useState("#1a1008");
  const [penSize, setPenSize] = useState(2.5);

  // ── Canvas helpers ────────────────────────────────────────────────────────

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      stroke.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }
  }, []);

  // Resize canvas on open / window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redraw();
    };

    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(canvas.parentElement);
    return () => obs.disconnect();
  }, [isOpen, redraw]);

  // Document-level pointer listeners for smooth drawing
  useEffect(() => {
    if (!isOpen) return;

    function onMove(e) {
      if (!isDrawingRef.current) return;
      const pos = getPos(e);
      if (!pos) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const last = lastPosRef.current;

      if (last) {
        ctx.beginPath();
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize * (window.devicePixelRatio || 1);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }

      currentStrokeRef.current.push(pos);
      lastPosRef.current = pos;
    }

    function onUp() {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      lastPosRef.current = null;
      if (currentStrokeRef.current.length > 1) {
        strokesRef.current.push({
          points: [...currentStrokeRef.current],
          color: penColor,
          size: penSize,
        });
      }
      currentStrokeRef.current = [];
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, [isOpen, penColor, penSize, getPos]);

  function onDown(e) {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
    currentStrokeRef.current = pos ? [pos] : [];

    // Draw a dot for single taps
    if (pos) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = penColor;
        ctx.arc(pos.x, pos.y, penSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function handleUndo() {
    strokesRef.current.pop();
    redraw();
  }

  function handleClear() {
    strokesRef.current = [];
    redraw();
  }

  // Paper texture via inline CSS
  const paperStyle = {
    background: "#f8f3e8",
    backgroundImage: [
      // Horizontal ruled lines
      "repeating-linear-gradient(transparent, transparent 27px, #c5cee0 27px, #c5cee0 28.5px)",
      // Faint left margin line
      "linear-gradient(90deg, transparent 47px, #e8a0a0 47px, #e8a0a0 49px, transparent 49px)",
      // Paper grain noise — subtle dots
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
    ].join(", "),
  };

  return (
    <>
      {/* ── Toggle button — always visible on the right edge ── */}
      <button
        onClick={onToggle}
        title={isOpen ? "Close scratchpad" : "Open scratchpad (stylus workspace)"}
        className="fixed top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-[#f8f3e8] border border-[#c5cee0] shadow-lg transition-all duration-300"
        style={{
          right: isOpen ? "calc((100vw - 540px) / 2 - 2px)" : 0,
          width: 22,
          height: 72,
          borderRadius: isOpen ? "6px 0 0 6px" : "6px 0 0 6px",
          borderRight: "none",
          writingMode: "vertical-rl",
        }}
      >
        {isOpen
          ? <ChevronRight className="w-3 h-3 text-stone-500 rotate-0" />
          : <ChevronLeft className="w-3 h-3 text-stone-500" />}
      </button>

      {/* ── Panel ── */}
      <div
        className="fixed top-0 right-0 z-30 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: "calc((100vw - 540px) / 2)",
          bottom: 64,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          minWidth: isOpen ? 160 : 0,
          pointerEvents: isOpen ? "all" : "none",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex flex-col gap-0.5 px-3 pt-3 pb-2 border-b border-[#c5cee0]"
          style={{ background: "#ede8d8" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PenLine className="w-3.5 h-3.5 text-stone-500" />
              <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Workings
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                title="Undo last stroke"
                className="p-1 rounded hover:bg-stone-200/60 text-stone-500 hover:text-stone-700 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                title="Clear all"
                className="p-1 rounded hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[9px] text-stone-400 leading-snug">
            Best with a stylus or touch pen
          </p>

          {/* Pen controls */}
          <div className="flex items-center gap-2 pt-1.5">
            {/* Colour picker */}
            <div className="flex gap-1">
              {PEN_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  title={label}
                  onClick={() => setPenColor(color)}
                  className="rounded-full border-2 transition-all"
                  style={{
                    width: 14,
                    height: 14,
                    background: color,
                    borderColor: penColor === color ? "#6b7280" : "transparent",
                    transform: penColor === color ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            <div className="w-px h-3 bg-stone-300" />

            {/* Size picker */}
            <div className="flex items-center gap-1">
              {PEN_SIZES.map(({ size, label }) => (
                <button
                  key={size}
                  title={label}
                  onClick={() => setPenSize(size)}
                  className="rounded-full border border-stone-400/40 flex items-center justify-center transition-all"
                  style={{
                    width: 16,
                    height: 16,
                    background: penSize === size ? "#78716c" : "transparent",
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: size + 3,
                      height: size + 3,
                      background: penSize === size ? "#f8f3e8" : "#78716c",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas area with paper texture */}
        <div className="flex-1 relative overflow-hidden" style={paperStyle}>
          {/* Top-left corner fold effect */}
          <div
            className="absolute top-0 right-0 pointer-events-none"
            style={{
              width: 20,
              height: 20,
              background: "linear-gradient(225deg, #d6cdb8 50%, transparent 50%)",
              opacity: 0.5,
            }}
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              touchAction: "none",
              cursor: "crosshair",
            }}
            onPointerDown={onDown}
          />

          {/* Empty state hint */}
          {strokesRef.current.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none select-none">
              <PenLine className="w-6 h-6 text-stone-300" />
              <p className="text-[10px] text-stone-300 text-center leading-relaxed px-3">
                Calculations &<br />working space
              </p>
            </div>
          )}
        </div>

        {/* Bottom — page indicator */}
        <div
          className="shrink-0 px-3 py-1.5 flex items-center justify-center"
          style={{ background: "#ede8d8", borderTop: "1px solid #c5cee0" }}
        >
          <p className="text-[9px] text-stone-400">scratch paper</p>
        </div>
      </div>
    </>
  );
}