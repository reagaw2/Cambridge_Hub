import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronDown, Trash2, Minus, Plus, Pen, Eraser } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ── Paper texture constants ────────────────────────────────────────────────
const PAPER_BG      = "#fef9ed";
const LINE_COLOR    = "#c5d5e8";
const MARGIN_COLOR  = "#f4a7a7";
const LINE_GAP      = 28;     // px between ruled lines
const MARGIN_X      = 48;     // px from left edge for red margin line

function drawPaperTexture(ctx, w, h) {
  // Cream background
  ctx.fillStyle = PAPER_BG;
  ctx.fillRect(0, 0, w, h);

  // Horizontal ruled lines
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 0.8;
  for (let y = LINE_GAP; y < h; y += LINE_GAP) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Red vertical margin line
  ctx.strokeStyle = MARGIN_COLOR;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, 0);
  ctx.lineTo(MARGIN_X, h);
  ctx.stroke();
}

export default function ScratchPad({ open, onClose }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);   // separate canvas for strokes (above texture)
  const containerRef = useRef(null);

  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);

  // Drawing state — kept in refs to avoid stale closures inside event listeners
  const isDrawingRef = useRef(false);
  const lastPosRef   = useRef({ x: 0, y: 0 });

  // ── Canvas sizing ──────────────────────────────────────────────────────
  const sizeCanvases = useCallback(() => {
    const container = containerRef.current;
    const bg  = canvasRef.current;
    const ov  = overlayRef.current;
    if (!container || !bg || !ov) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();

    [bg, ov].forEach(c => {
      if (c.width  !== Math.round(width  * dpr) ||
          c.height !== Math.round(height * dpr)) {
        c.width  = Math.round(width  * dpr);
        c.height = Math.round(height * dpr);
        c.style.width  = `${width}px`;
        c.style.height = `${height}px`;
      }
    });

    // Redraw texture (non-destructive — strokes sit on separate overlay)
    const ctx = bg.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPaperTexture(ctx, width, height);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Give the panel time to render before measuring
    const t = setTimeout(sizeCanvases, 50);
    const obs = new ResizeObserver(sizeCanvases);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, [open, sizeCanvases]);

  // ── Drawing helpers ────────────────────────────────────────────────────
  function getPos(e) {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current   = getPos(e);

    if (tool === "eraser") return; // erase on move
    // Start a dot for single tap
    const ov  = overlayRef.current;
    if (!ov) return;
    const ctx = ov.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const pos = lastPosRef.current;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [tool, strokeWidth]);

  const onPointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const pos = getPos(e);
    const ov  = overlayRef.current;
    if (!ov) return;
    const ctx = ov.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (tool === "eraser") {
      ctx.clearRect(pos.x - 12, pos.y - 12, 24, 24);
    } else {
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth   = strokeWidth;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    ctx.restore();
    lastPosRef.current = pos;
  }, [tool, strokeWidth]);

  const onPointerUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  // Document-level listeners so strokes don't break if pointer leaves canvas
  useEffect(() => {
    if (!open) return;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup",   onPointerUp);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup",   onPointerUp);
    };
  }, [open, onPointerMove, onPointerUp]);

  function clearPad() {
    const ov = overlayRef.current;
    if (!ov) return;
    ov.getContext("2d").clearRect(0, 0, ov.width, ov.height);
  }

  // ── Stroke-width helpers ───────────────────────────────────────────────
  const decrease = () => setStrokeWidth(w => Math.max(1, w - 1));
  const increase = () => setStrokeWidth(w => Math.min(8, w + 1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          className="fixed left-0 right-0 z-30 flex flex-col shadow-2xl"
          style={{
            // sit just above the bottom nav bar (56px) + safe area
            bottom: "calc(env(safe-area-inset-bottom) + 56px)",
            height: "46vh",
            maxHeight: 380,
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-2 shrink-0 select-none"
            style={{ background: "#f5ede0", borderBottom: `1px solid ${LINE_COLOR}` }}
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-stone-600">
                ✏️ Scratch Space
              </p>
              <p className="text-[10px] text-stone-400 leading-snug mt-0.5">
                Working area for calculations · Best with a stylus or touch pen
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Tool toggle */}
              <button
                onClick={() => setTool(t => t === "pen" ? "eraser" : "pen")}
                title={tool === "pen" ? "Switch to eraser" : "Switch to pen"}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  tool === "eraser"
                    ? "bg-amber-100 border-amber-400 text-amber-700"
                    : "bg-stone-100 border-stone-300 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {tool === "eraser" ? <Eraser className="w-3.5 h-3.5" /> : <Pen className="w-3.5 h-3.5" />}
                {tool === "eraser" ? "Eraser" : "Pen"}
              </button>

              {/* Stroke width */}
              <div className="flex items-center gap-1 bg-stone-100 border border-stone-300 rounded-lg px-1.5 py-1">
                <button onClick={decrease} className="w-5 h-5 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-mono font-bold text-stone-600 w-3 text-center">{strokeWidth}</span>
                <button onClick={increase} className="w-5 h-5 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Clear */}
              <button
                onClick={clearPad}
                title="Clear scratch pad"
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-100 border border-stone-300 text-stone-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                title="Close scratch pad"
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-100 border border-stone-300 text-stone-400 hover:text-stone-700 transition-all"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Canvas area ── */}
          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden"
            style={{
              background: PAPER_BG,
              // Subtle paper grain via CSS
              backgroundImage: `
                repeating-linear-gradient(
                  transparent,
                  transparent ${LINE_GAP - 1}px,
                  ${LINE_COLOR} ${LINE_GAP - 1}px,
                  ${LINE_COLOR} ${LINE_GAP}px
                )
              `,
              cursor: tool === "eraser" ? "cell" : "crosshair",
              touchAction: "none",
            }}
          >
            {/* Left margin line */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: MARGIN_X, width: 1.2, background: MARGIN_COLOR, opacity: 0.7 }}
            />

            {/* Background texture canvas (paper) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              style={{ pointerEvents: "none" }}
            />

            {/* Overlay canvas for strokes */}
            <canvas
              ref={overlayRef}
              className="absolute inset-0"
              style={{ touchAction: "none" }}
              onPointerDown={onPointerDown}
            />

            {/* Empty-state hint */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ paddingLeft: MARGIN_X + 8 }}
            >
              <p
                className="text-[13px] font-medium italic"
                style={{ color: "#c8b99a", fontFamily: "Georgia, serif" }}
              >
                Write your working here…
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}