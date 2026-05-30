import { useState, useRef, useEffect, useCallback } from "react";
import { Highlighter, PenLine, Circle, Eraser, Trash2 } from "lucide-react";

const HIGHLIGHT_COLORS = [
  { color: "#FDE68A", label: "Yellow" },
  { color: "#BBF7D0", label: "Green" },
  { color: "#FBCFE8", label: "Pink" },
  { color: "#BAE6FD", label: "Blue" },
];

// Walk all text nodes in a container to compute the absolute character offset
function getAbsoluteOffset(container, targetNode, targetOffset) {
  let count = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    if (node === targetNode) return count + targetOffset;
    count += node.nodeValue.length;
  }
  return count + targetOffset;
}

// Render question text with annotation spans
function AnnotatedText({ text, annotations, onRemoveAnn }) {
  if (!text) return null;

  const inline = (raw) =>
    raw.split("\n").flatMap((line, i, arr) =>
      i < arr.length - 1 ? [line, <br key={i} />] : [line]
    );

  if (!annotations.length) return <>{inline(text)}</>;

  const sorted = [...annotations].sort((a, b) => a.start - b.start);
  const segs = [];
  let pos = 0;

  for (const ann of sorted) {
    const start = Math.max(ann.start, pos);
    const end = Math.min(ann.end, text.length);
    if (start >= end) continue;
    if (start > pos) segs.push({ text: text.slice(pos, start), ann: null });
    segs.push({ text: text.slice(start, end), ann });
    pos = end;
  }
  if (pos < text.length) segs.push({ text: text.slice(pos), ann: null });

  return (
    <>
      {segs.map((seg, i) => {
        const content = inline(seg.text);
        if (!seg.ann) return <span key={i}>{content}</span>;
        if (seg.ann.type === "highlight") {
          return (
            <mark
              key={i}
              onClick={() => onRemoveAnn?.(seg.ann.id)}
              style={{
                background: seg.ann.color,
                borderRadius: 2,
                padding: "1px 1px",
                cursor: "pointer",
              }}
            >
              {content}
            </mark>
          );
        }
        if (seg.ann.type === "underline") {
          return (
            <span
              key={i}
              onClick={() => onRemoveAnn?.(seg.ann.id)}
              style={{
                textDecoration: `underline 2.5px ${seg.ann.color}`,
                textUnderlineOffset: "3px",
                cursor: "pointer",
              }}
            >
              {content}
            </span>
          );
        }
        return <span key={i}>{content}</span>;
      })}
    </>
  );
}

function ToolBtn({ active, onClick, label, children }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all text-xs font-bold ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-white/50 hover:text-white hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

export default function QuestionAnnotator({ text, questionId }) {
  const [activeTool, setActiveTool] = useState(null);
  const [hlColor, setHlColor] = useState("#FDE68A");
  const [annotationsMap, setAnnotationsMap] = useState({});
  const [drawMap, setDrawMap] = useState({});

  const textRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPtsRef = useRef([]);
  const circleStartRef = useRef(null);

  // Refs for use inside event handlers / RAF (avoids stale closures)
  const activeToolRef = useRef(null);
  const drawMapRef = useRef({});
  const questionIdRef = useRef(questionId);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { drawMapRef.current = drawMap; }, [drawMap]);
  useEffect(() => { questionIdRef.current = questionId; }, [questionId]);

  const currentAnns = annotationsMap[questionId] ?? [];
  const currentDraws = drawMap[questionId] ?? [];

  function updateAnns(fn) {
    setAnnotationsMap((prev) => ({
      ...prev,
      [questionId]: typeof fn === "function" ? fn(prev[questionId] ?? []) : fn,
    }));
  }

  function updateDraws(fn) {
    setDrawMap((prev) => ({
      ...prev,
      [questionId]: typeof fn === "function" ? fn(prev[questionId] ?? []) : fn,
    }));
  }

  const isTextTool = activeTool === "highlight" || activeTool === "underline";
  const isDrawTool = activeTool === "pen" || activeTool === "circle";
  const isEraserTool = activeTool === "eraser";
  const hasAnns = currentAnns.length > 0 || currentDraws.length > 0;

  // ── Canvas ──────────────────────────────────────────────────────────────

  const redrawCanvas = useCallback((previewEnd = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const qId = questionIdRef.current;
    const tool = activeToolRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const paths = drawMapRef.current[qId] ?? [];

    for (const p of paths) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      if (p.type === "freehand") {
        ctx.beginPath();
        p.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x * W, pt.y * H);
          else ctx.lineTo(pt.x * W, pt.y * H);
        });
        ctx.stroke();
      } else if (p.type === "circle") {
        const cx = ((p.x1 + p.x2) / 2) * W;
        const cy = ((p.y1 + p.y2) / 2) * H;
        const rx = Math.abs(p.x2 - p.x1) / 2 * W;
        const ry = Math.abs(p.y2 - p.y1) / 2 * H;
        if (rx > 1 && ry > 1) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // In-progress freehand
    if (tool === "pen" && currentPtsRef.current.length > 1) {
      ctx.strokeStyle = "#1a1f2e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      currentPtsRef.current.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x * W, pt.y * H);
        else ctx.lineTo(pt.x * W, pt.y * H);
      });
      ctx.stroke();
    }

    // Circle preview (dashed)
    if (tool === "circle" && circleStartRef.current && previewEnd) {
      const s = circleStartRef.current;
      const cx = ((s.x + previewEnd.x) / 2) * W;
      const cy = ((s.y + previewEnd.y) / 2) * H;
      const rx = Math.abs(previewEnd.x - s.x) / 2 * W;
      const ry = Math.abs(previewEnd.y - s.y) / 2 * H;
      if (rx > 1 && ry > 1) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, []);

  // Resize canvas to match text container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = textRef.current;
    if (!canvas || !container) return;

    let raf;
    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
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
  }, [questionId, redrawCanvas]);

  // Redraw whenever draw data changes
  useEffect(() => { redrawCanvas(); }, [currentDraws, questionId, redrawCanvas]);

  // ── Canvas pointer events ──────────────────────────────────────────────

  function getPos(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) / rect.width,
      y: (src.clientY - rect.top) / rect.height,
    };
  }

  function onCanvasDown(e) {
    if (!isDrawTool && !isEraserTool) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    if (activeTool === "pen") currentPtsRef.current = [pos];
    else if (activeTool === "circle") circleStartRef.current = pos;
    else if (activeTool === "eraser") eraseAt(pos);
  }

  function onCanvasMove(e) {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    if (activeTool === "pen") {
      currentPtsRef.current.push(pos);
      redrawCanvas();
    } else if (activeTool === "circle") {
      redrawCanvas(pos);
    } else if (activeTool === "eraser") {
      eraseAt(pos);
    }
  }

  function onCanvasUp(e) {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pos = getPos(e);

    if (activeTool === "pen" && currentPtsRef.current.length > 1) {
      updateDraws((prev) => [
        ...prev,
        { id: `p${Date.now()}`, type: "freehand", points: [...currentPtsRef.current], color: "#1a1f2e", width: 2 },
      ]);
    } else if (activeTool === "circle" && circleStartRef.current) {
      const s = circleStartRef.current;
      if (Math.hypot(pos.x - s.x, pos.y - s.y) > 0.02) {
        updateDraws((prev) => [
          ...prev,
          { id: `c${Date.now()}`, type: "circle", x1: s.x, y1: s.y, x2: pos.x, y2: pos.y, color: "#ef4444", width: 2.5 },
        ]);
      }
      circleStartRef.current = null;
    }

    currentPtsRef.current = [];
    redrawCanvas();
  }

  function eraseAt(pos) {
    const T = 0.05;
    updateDraws((prev) =>
      prev.filter((p) => {
        if (p.type === "freehand") return !p.points.some((pt) => Math.hypot(pt.x - pos.x, pt.y - pos.y) < T);
        if (p.type === "circle") {
          const cx = (p.x1 + p.x2) / 2, cy = (p.y1 + p.y2) / 2;
          return Math.hypot(cx - pos.x, cy - pos.y) > T * 2;
        }
        return true;
      })
    );
  }

  // ── Text selection ─────────────────────────────────────────────────────

  function onTextMouseUp() {
    if (!isTextTool) return;
    // Small timeout so selection is fully committed
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const container = textRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) return;

      const start = getAbsoluteOffset(container, range.startContainer, range.startOffset);
      const end = getAbsoluteOffset(container, range.endContainer, range.endOffset);

      const s = Math.max(0, Math.min(start, text.length));
      const e = Math.max(0, Math.min(end, text.length));
      if (s >= e) return;

      updateAnns((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          start: s,
          end: e,
          type: activeTool,
          color: activeTool === "highlight" ? hlColor : "#93C5FD",
        },
      ]);
      sel.removeAllRanges();
    }, 0);
  }

  function removeAnnotation(id) {
    updateAnns((prev) => prev.filter((a) => a.id !== id));
  }

  function selectTool(id) {
    setActiveTool((prev) => (prev === id ? null : id));
  }

  // Hint messages
  const HINTS = {
    highlight: "Select text to highlight it",
    underline: "Select text to underline it",
    pen: "Scribble freely on the question",
    circle: "Drag to circle key words or diagrams",
    eraser: "Click highlighted text or draw over pen marks",
  };

  return (
    <div className="space-y-2">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#111827]/80 backdrop-blur border border-white/10 rounded-xl px-2 py-1.5">
          {/* Text tools */}
          <ToolBtn active={activeTool === "highlight"} onClick={() => selectTool("highlight")} label="Highlight">
            <Highlighter className="w-3.5 h-3.5" style={{ color: activeTool === "highlight" ? hlColor : undefined }} />
          </ToolBtn>

          <ToolBtn active={activeTool === "underline"} onClick={() => selectTool("underline")} label="Underline">
            <span
              className="text-sm font-black leading-none"
              style={{ textDecoration: "underline 2px #93C5FD", textUnderlineOffset: "2px" }}
            >
              U
            </span>
          </ToolBtn>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          {/* Draw tools */}
          <ToolBtn active={activeTool === "pen"} onClick={() => selectTool("pen")} label="Scribble / Pen">
            <PenLine className="w-3.5 h-3.5" />
          </ToolBtn>

          <ToolBtn active={activeTool === "circle"} onClick={() => selectTool("circle")} label="Circle / Oval">
            <Circle
              className="w-3.5 h-3.5"
              style={{ color: activeTool === "circle" ? "#ef4444" : undefined }}
            />
          </ToolBtn>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          {/* Eraser */}
          <ToolBtn active={activeTool === "eraser"} onClick={() => selectTool("eraser")} label="Eraser">
            <Eraser className="w-3.5 h-3.5" />
          </ToolBtn>

          {/* Clear all */}
          {hasAnns && (
            <>
              <div className="w-px h-4 bg-white/15 mx-0.5" />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { updateAnns([]); updateDraws([]); }}
                title="Clear all annotations"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/15 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Annotation count badge */}
        {hasAnns && (
          <span className="text-[10px] text-white/25 font-mono">
            {currentAnns.length + currentDraws.length} mark{currentAnns.length + currentDraws.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Highlight colour swatches */}
      {activeTool === "highlight" && (
        <div className="flex items-center gap-1.5 px-0.5">
          {HIGHLIGHT_COLORS.map(({ color, label }) => (
            <button
              key={color}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setHlColor(color)}
              title={label}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                background: color,
                borderColor: hlColor === color ? "#fff" : "transparent",
                transform: hlColor === color ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
          <span className="text-[10px] text-white/25 ml-1">Choose colour</span>
        </div>
      )}

      {/* Status hint */}
      {activeTool && (
        <p className="text-[10px] text-white/30 px-0.5 -mt-0.5">
          {HINTS[activeTool]}
        </p>
      )}

      {/* ── Question text + canvas overlay ── */}
      <div
        ref={textRef}
        className="relative"
        onMouseUp={onTextMouseUp}
        onTouchEnd={onTextMouseUp}
      >
        {/* Annotated question text */}
        <div
          className="text-[15px] leading-relaxed text-foreground/90 relative z-0"
          style={{
            userSelect: isDrawTool ? "none" : "text",
            WebkitUserSelect: isDrawTool ? "none" : "text",
            cursor: isDrawTool ? "crosshair" : isEraserTool ? "cell" : isTextTool ? "text" : "auto",
          }}
        >
          <AnnotatedText
            text={text}
            annotations={currentAnns}
            onRemoveAnn={isEraserTool ? removeAnnotation : undefined}
          />
        </div>

        {/* Transparent canvas for freehand drawing */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded"
          style={{
            pointerEvents: isDrawTool || isEraserTool ? "all" : "none",
            zIndex: 10,
            touchAction: "none",
            cursor: isDrawTool ? "crosshair" : isEraserTool ? "cell" : "default",
          }}
          onMouseDown={onCanvasDown}
          onMouseMove={onCanvasMove}
          onMouseUp={onCanvasUp}
          onMouseLeave={onCanvasUp}
          onTouchStart={onCanvasDown}
          onTouchMove={onCanvasMove}
          onTouchEnd={onCanvasUp}
        />
      </div>
    </div>
  );
}