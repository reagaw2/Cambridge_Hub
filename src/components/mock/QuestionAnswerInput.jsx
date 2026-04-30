/**
 * QuestionAnswerInput — renders appropriate input based on question_type.
 * Types: written, code, table_fill, matching, drawing (basic), default → written
 */
import { useState, useRef, useEffect, useCallback } from "react";

// ─── Written ──────────────────────────────────────────────────────────────
function WrittenInput({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(120, ref.current.scrollHeight) + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder="Write your answer here..."
      style={{ minHeight: 120, resize: "none", overflow: "hidden" }}
      className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
    />
  );
}

// ─── Code ─────────────────────────────────────────────────────────────────
function CodeInput({ value, onChange, language }) {
  const ref = useRef(null);

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = (value ?? "").substring(0, start) + "  " + (value ?? "").substring(end);
      onChange(newVal);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2; }, 0);
    }
  }

  return (
    <div className="space-y-1.5">
      {language && (
        <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground px-1">{language}</p>
      )}
      <textarea
        ref={ref}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your code here..."
        style={{ minHeight: 160, fontFamily: "monospace", resize: "vertical" }}
        className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        spellCheck={false}
      />
    </div>
  );
}

// ─── Table Fill ───────────────────────────────────────────────────────────
function TableFillInput({ question, value, onChange }) {
  const { table_data } = question;
  if (!table_data) return <WrittenInput value={value} onChange={onChange} />;

  const { headers = [], rows = [], editable_cols = [], input_type = "text" } = table_data;

  // value is a 2D array of cell values
  const cellValues = value && Array.isArray(value) ? value : rows.map(row => [...row]);

  function setCellValue(ri, ci, val) {
    const next = cellValues.map((row, r) => row.map((cell, c) => {
      if (r === ri && c === ci) return val;
      // For radio-style: clear other cols in same row
      if (input_type === "checkbox_single_per_row" && r === ri && editable_cols.includes(c)) return false;
      return cell;
    }));
    // restore the clicked cell
    if (input_type === "checkbox_single_per_row") {
      next[ri][ci] = val;
    }
    onChange(next);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ border: "1px solid #555", padding: "6px 12px", background: "rgba(255,255,255,0.06)", fontWeight: 600, textAlign: "center" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cellValues.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                const isEditable = editable_cols.includes(ci);
                const cellVal = cellValues[ri]?.[ci] ?? cell;
                if (!isEditable) {
                  return (
                    <td key={ci} style={{ border: "1px solid #555", padding: "6px 12px", textAlign: "center" }}>
                      {cell}
                    </td>
                  );
                }
                if (input_type === "text") {
                  return (
                    <td key={ci} style={{ border: "1px solid #555", padding: "4px 8px" }}>
                      <input
                        type="text"
                        value={cellVal ?? ""}
                        onChange={e => setCellValue(ri, ci, e.target.value)}
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", textAlign: "center", color: "inherit", fontSize: 13 }}
                      />
                    </td>
                  );
                }
                if (input_type === "checkbox_single_per_row") {
                  return (
                    <td key={ci} style={{ border: "1px solid #555", padding: "6px 12px", textAlign: "center" }}>
                      <input
                        type="radio"
                        checked={!!cellVal}
                        onChange={() => setCellValue(ri, ci, true)}
                        name={`radio-row-${ri}`}
                        style={{ cursor: "pointer", width: 16, height: 16 }}
                      />
                    </td>
                  );
                }
                // checkbox
                return (
                  <td key={ci} style={{ border: "1px solid #555", padding: "6px 12px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!cellVal}
                      onChange={e => setCellValue(ri, ci, e.target.checked)}
                      style={{ cursor: "pointer", width: 16, height: 16 }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Matching ─────────────────────────────────────────────────────────────
function MatchingInput({ question, value, onChange }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const { matching_data } = question;

  if (!matching_data) return <WrittenInput value={value} onChange={onChange} />;

  const { from_items = [], to_items = [] } = matching_data;
  // value: array of [leftIdx, rightIdx]
  const matches = value && Array.isArray(value) ? value : [];

  function handleLeftClick(i) {
    // If already matched, remove match
    const existing = matches.find(([l]) => l === i);
    if (existing) {
      onChange(matches.filter(([l]) => l !== i));
      return;
    }
    setSelectedLeft(i);
  }

  function handleRightClick(j) {
    if (selectedLeft === null) return;
    // Remove any existing match involving this right item or this left item
    const cleaned = matches.filter(([l, r]) => l !== selectedLeft && r !== j);
    onChange([...cleaned, [selectedLeft, j]]);
    setSelectedLeft(null);
  }

  function getMatchedRight(li) {
    return matches.find(([l]) => l === li)?.[1] ?? null;
  }

  function getMatchedLeft(ri) {
    return matches.find(([, r]) => r === ri)?.[0] ?? null;
  }

  const colors = ["#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa", "#34d399", "#fbbf24", "#f87171"];

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">Click a left item, then a right item to match them. Click again to unmatch.</p>
      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Items</p>
          {from_items.map((item, i) => {
            const matchedTo = getMatchedRight(i);
            const color = matchedTo !== null ? colors[matchedTo % colors.length] : undefined;
            const isSelected = selectedLeft === i;
            return (
              <button
                key={i}
                onClick={() => handleLeftClick(i)}
                style={{ borderColor: color ?? undefined, color: color ?? undefined }}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary/20 border-primary text-primary"
                    : matchedTo !== null
                      ? "bg-card"
                      : "bg-card border-border text-foreground hover:brightness-110"
                }`}
              >
                {item}
                {matchedTo !== null && <span className="ml-2 text-[10px] opacity-70">→ {to_items[matchedTo]?.slice(0, 12)}</span>}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Match to</p>
          {to_items.map((item, j) => {
            const matchedFrom = getMatchedLeft(j);
            const color = matchedFrom !== null ? colors[j % colors.length] : undefined;
            return (
              <button
                key={j}
                onClick={() => handleRightClick(j)}
                style={{ borderColor: color ?? undefined, color: color ?? undefined }}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  matchedFrom !== null
                    ? "bg-card"
                    : selectedLeft !== null
                      ? "bg-primary/5 border-border text-foreground hover:border-primary/40 hover:brightness-110"
                      : "bg-card border-border text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {matches.length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your matches</p>
          {matches.map(([l, r], i) => (
            <p key={i} className="text-xs text-foreground/80">{from_items[l]} → {to_items[r]}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Drawing (basic freehand fallback) ────────────────────────────────────
function DrawingInput({ question, value, onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value?.imageData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value.imageData;
    }
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#fff" : "#222";
    ctx.lineWidth = tool === "eraser" ? 20 : 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw(e) {
    e.preventDefault();
    setDrawing(false);
    lastPos.current = null;
    // Save as base64
    const canvas = canvasRef.current;
    onChange({ imageData: canvas.toDataURL("image/png") });
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange({ imageData: null });
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">
        {question.drawing_config?.type === "logic_circuit"
          ? "Draw your logic circuit below. Label inputs and outputs clearly."
          : question.drawing_config?.type === "er_diagram"
            ? "Draw your ER diagram below. Label entities and relationships."
            : "Draw your answer below."}
      </p>
      <div className="flex gap-2 flex-wrap">
        {["pen", "eraser"].map(t => (
          <button key={t} onClick={() => setTool(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
              tool === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:brightness-110"
            }`}>
            {t === "pen" ? "✏️ Pen" : "🧹 Eraser"}
          </button>
        ))}
        <button onClick={clearCanvas} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/40 text-red-400 bg-red-500/10 hover:brightness-110 transition-all">
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={300}
        style={{ width: "100%", height: 300, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "#fff", touchAction: "none", cursor: tool === "eraser" ? "crosshair" : "pen" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
export default function QuestionAnswerInput({ question, value, onChange }) {
  const type = question?.question_type ?? "written";

  if (type === "code") {
    return <CodeInput value={value} onChange={onChange} language={question.code_language} />;
  }
  if (type === "table_fill") {
    return <TableFillInput question={question} value={value} onChange={onChange} />;
  }
  if (type === "matching") {
    return <MatchingInput question={question} value={value} onChange={onChange} />;
  }
  if (type === "drawing") {
    return <DrawingInput question={question} value={value} onChange={onChange} />;
  }
  // default: written
  return <WrittenInput value={value} onChange={onChange} />;
}