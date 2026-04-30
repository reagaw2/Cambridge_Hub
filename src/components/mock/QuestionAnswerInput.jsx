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
// Supports up to 2 connections per left item.
// matches: array of {from: leftIdx, to: rightIdx}
function MatchingInput({ question, value, onChange }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const { matching_data } = question;

  if (!matching_data) return <WrittenInput value={value} onChange={onChange} />;

  // Support both {left, right} and legacy {from_items, to_items}
  const leftItems = matching_data.left ?? matching_data.from_items ?? [];
  const rightItems = matching_data.right ?? matching_data.to_items ?? [];
  const leftLabel = matching_data.left_label ?? "Changes";
  const rightLabel = matching_data.right_label ?? "Impacts";

  // matches: array of {from, to}
  const matches = Array.isArray(value) ? value : [];

  const colors = ["#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa", "#34d399", "#fbbf24", "#f87171"];

  function getMatchesForLeft(li) {
    return matches.filter(m => m.from === li);
  }
  function getMatchesForRight(ri) {
    return matches.filter(m => m.to === ri);
  }

  function handleLeftClick(i) {
    if (selectedLeft === i) {
      setSelectedLeft(null); // deselect
    } else {
      setSelectedLeft(i);
    }
  }

  function handleRightClick(j) {
    if (selectedLeft === null) return;

    const alreadyMatched = matches.find(m => m.from === selectedLeft && m.to === j);
    if (alreadyMatched) {
      // Remove this specific connection
      onChange(matches.filter(m => !(m.from === selectedLeft && m.to === j)));
      setSelectedLeft(null);
      return;
    }

    // Allow up to 2 connections per left item
    const leftConns = getMatchesForLeft(selectedLeft);
    if (leftConns.length >= 2) return; // already at max

    onChange([...matches, { from: selectedLeft, to: j }]);
    // Keep selectedLeft active if < 2 connections
    if (leftConns.length + 1 >= 2) setSelectedLeft(null);
  }

  function removeMatch(from, to) {
    onChange(matches.filter(m => !(m.from === from && m.to === to)));
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground/80">
        Click a <strong>left item</strong> to select it (highlighted blue), then click a <strong>right item</strong> to connect them.
        Each left item can have up to 2 connections. Click a matched pair again to remove it.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{leftLabel}</p>
          {leftItems.map((item, i) => {
            const conns = getMatchesForLeft(i);
            const isSelected = selectedLeft === i;
            const isMatched = conns.length > 0;
            return (
              <button
                key={i}
                onClick={() => handleLeftClick(i)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm leading-snug transition-all ${
                  isSelected
                    ? "bg-primary/20 border-primary text-primary ring-1 ring-primary/40"
                    : isMatched
                      ? "bg-green-500/10 border-green-500/40 text-foreground"
                      : "bg-card border-border text-foreground hover:brightness-110"
                }`}
              >
                {item}
                {isMatched && (
                  <span className="block text-[10px] text-green-400 mt-0.5">
                    {conns.map(c => `→ ${rightItems[c.to]}`).join(" | ")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{rightLabel}</p>
          {rightItems.map((item, j) => {
            const conns = getMatchesForRight(j);
            const isMatched = conns.length > 0;
            const isTarget = selectedLeft !== null;
            return (
              <button
                key={j}
                onClick={() => handleRightClick(j)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm leading-snug transition-all ${
                  isMatched
                    ? "bg-green-500/10 border-green-500/40 text-foreground"
                    : isTarget
                      ? "bg-card border-primary/30 text-foreground hover:border-primary hover:bg-primary/10"
                      : "bg-card border-border text-foreground"
                }`}
              >
                {item}
                {isMatched && (
                  <span className="block text-[10px] text-green-400 mt-0.5">
                    {conns.map(c => `← ${leftItems[c.from]}`).join(" | ")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matched pairs summary with remove buttons */}
      {matches.length > 0 && (
        <div className="bg-secondary/40 border border-border rounded-xl p-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your connections ({matches.length})</p>
          {matches.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <p className="text-xs text-foreground/80 flex-1">
                <span className="text-primary font-medium">{leftItems[m.from]}</span>
                <span className="text-muted-foreground mx-1">→</span>
                <span className="text-green-400 font-medium">{rightItems[m.to]}</span>
              </p>
              <button
                onClick={() => removeMatch(m.from, m.to)}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors px-1.5 py-0.5 rounded border border-red-400/30 hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
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