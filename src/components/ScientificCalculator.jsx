import { useState, useCallback } from "react";
import { X } from "lucide-react";

// ── Calculator logic ──────────────────────────────────────────────────────────

function safeEval(expr) {
  try {
    let e = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9a-z])/gi, (m, offset, str) => {
        // only replace standalone 'e' not part of something like "exp"
        return m === "e" ? String(Math.E) : m;
      })
      .replace(/sin⁻¹\(/g, "Math.asin(")
      .replace(/cos⁻¹\(/g, "Math.acos(")
      .replace(/tan⁻¹\(/g, "Math.atan(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/\^/g, "**")
      .replace(/Ans/g, "0"); // fallback
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + e + ")")();
    if (!isFinite(result) || isNaN(result)) return "Math ERROR";
    return String(parseFloat(result.toPrecision(10)));
  } catch {
    return "Syntax ERROR";
  }
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ── Button component ──────────────────────────────────────────────────────────

function CalcBtn({ label, shiftLabel, alphaLabel, color = "default", wide = false, tall = false, onClick, onShiftClick, onAlphaClick, shiftActive, alphaActive }) {
  const colors = {
    default:  { bg: "#323232", text: "#ffffff", border: "#444" },
    op:       { bg: "#3a3a3a", text: "#ffffff", border: "#555" },
    equals:   { bg: "#e67e00", text: "#ffffff", border: "#b86000" },
    ac:       { bg: "#cc3333", text: "#ffffff", border: "#aa2222" },
    del:      { bg: "#884400", text: "#ffffff", border: "#663300" },
    shift:    { bg: "#e8940a", text: "#000000", border: "#c07800" },
    alpha:    { bg: "#8b1a1a", text: "#ffffff", border: "#6a1212" },
    nav:      { bg: "#2a2a6a", text: "#ffffff", border: "#1a1a55" },
    light:    { bg: "#4a4a4a", text: "#ffffff", border: "#5a5a5a" },
  };

  const c = colors[color] ?? colors.default;

  function handleClick() {
    if (shiftActive && shiftLabel && onShiftClick) { onShiftClick(shiftLabel); return; }
    if (alphaActive && alphaLabel && onAlphaClick) { onAlphaClick(alphaLabel); return; }
    onClick(label);
  }

  const displayShift = shiftLabel;
  const displayAlpha = alphaLabel;

  return (
    <button
      onMouseDown={e => e.preventDefault()}
      onClick={handleClick}
      style={{
        background: `linear-gradient(180deg, ${c.bg}ee, ${c.bg}cc)`,
        border: `1px solid ${c.border}`,
        color: c.text,
        borderRadius: 4,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: wide ? "4px 2px" : "3px 1px",
        minHeight: tall ? 44 : 30,
        position: "relative",
        boxShadow: "0 2px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        transition: "filter 0.08s, transform 0.08s",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
        flexShrink: 0,
      }}
      onTouchStart={e => { e.currentTarget.style.filter = "brightness(1.3)"; e.currentTarget.style.transform = "translateY(1px)"; }}
      onTouchEnd={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
      onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
      onMouseDown2={e => { e.currentTarget.style.transform = "translateY(1px)"; }}
    >
      {/* Shift label (orange) */}
      {displayShift && (
        <span style={{ fontSize: 7, color: "#f5a623", lineHeight: 1, fontWeight: 600, letterSpacing: 0.2, position: "absolute", top: 2, left: 2 }}>
          {displayShift}
        </span>
      )}
      {/* Alpha label (green) */}
      {displayAlpha && (
        <span style={{ fontSize: 7, color: "#4fc3f7", lineHeight: 1, fontWeight: 600, position: "absolute", top: 2, right: 2 }}>
          {displayAlpha}
        </span>
      )}
      {/* Main label */}
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", lineHeight: 1, marginTop: (displayShift || displayAlpha) ? 6 : 0 }}>
        {label}
      </span>
    </button>
  );
}

// ── Main calculator ───────────────────────────────────────────────────────────

export default function ScientificCalculator({ onClose }) {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [lastAns, setLastAns] = useState("0");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isDeg, setIsDeg] = useState(true);
  const [shiftActive, setShiftActive] = useState(false);
  const [alphaActive, setAlphaActive] = useState(false);
  const [history, setHistory] = useState([]);

  const toRad = useCallback((v) => isDeg ? (v * Math.PI) / 180 : v, [isDeg]);
  const fromRad = useCallback((v) => isDeg ? (v * 180) / Math.PI : v, [isDeg]);

  function handleButton(label) {
    setShiftActive(false);
    setAlphaActive(false);

    // Mode toggles
    if (label === "SHIFT") { setShiftActive(s => !s); return; }
    if (label === "ALPHA") { setAlphaActive(s => !s); return; }
    if (label === "ON") { setDisplay("0"); setExpr(""); setWaitingForOperand(false); return; }
    if (label === "AC") { setDisplay("0"); setExpr(""); setWaitingForOperand(false); return; }
    if (label === "DEL") {
      setDisplay(d => {
        if (d === "Math ERROR" || d === "Syntax ERROR") return "0";
        return d.length > 1 ? d.slice(0, -1) : "0";
      });
      return;
    }
    if (label === "MODE") { setIsDeg(d => !d); return; }
    if (label === "Ans") { setDisplay(lastAns); setWaitingForOperand(false); return; }

    // Unary scientific functions
    const unaryFns = {
      "sin": v => Math.sin(toRad(v)),
      "cos": v => Math.cos(toRad(v)),
      "tan": v => Math.tan(toRad(v)),
      "sin⁻¹": v => fromRad(Math.asin(v)),
      "cos⁻¹": v => fromRad(Math.acos(v)),
      "tan⁻¹": v => fromRad(Math.atan(v)),
      "√": v => Math.sqrt(v),
      "log": v => Math.log10(v),
      "ln": v => Math.log(v),
      "x²": v => v * v,
      "x⁻¹": v => 1 / v,
      "x!": v => factorial(Math.round(v)),
      "10ˣ": v => Math.pow(10, v),
      "eˣ": v => Math.exp(v),
      "∛": v => Math.cbrt(v),
      "Abs": v => Math.abs(v),
    };

    if (unaryFns[label]) {
      const val = parseFloat(display);
      const result = unaryFns[label](val);
      const str = !isFinite(result) || isNaN(result) ? "Math ERROR" : String(parseFloat(result.toPrecision(10)));
      setDisplay(str);
      setWaitingForOperand(true);
      return;
    }

    // Constants
    if (label === "π") { setDisplay(String(Math.PI)); setWaitingForOperand(false); return; }
    if (label === "e") { setDisplay(String(Math.E)); setWaitingForOperand(false); return; }
    if (label === "Rnd") { setDisplay(String(Math.random().toPrecision(9))); setWaitingForOperand(true); return; }

    // Operators that start expression building
    if (["+", "−", "×", "÷"].includes(label)) {
      setExpr(display + " " + label + " ");
      setWaitingForOperand(true);
      return;
    }
    if (label === "xʸ") { setExpr(display + "^"); setWaitingForOperand(true); return; }
    if (label === "ˣ√y") { setExpr(display + "^(1/"); setWaitingForOperand(true); return; }
    if (label === "EXP") { setExpr(display + "×10^"); setWaitingForOperand(true); return; }
    if (label === "(") { setExpr(e => e + "("); setDisplay("0"); setWaitingForOperand(true); return; }
    if (label === ")") {
      const full = expr + display + ")";
      const result = safeEval(full);
      setDisplay(result);
      setExpr(full);
      setWaitingForOperand(true);
      return;
    }
    if (label === "%") { setDisplay(d => String(parseFloat(d) / 100)); return; }

    // Equals
    if (label === "=") {
      const full = expr + display;
      const result = safeEval(full);
      if (result !== "Math ERROR" && result !== "Syntax ERROR") {
        setLastAns(result);
        setHistory(h => [[full, result], ...h].slice(0, 5));
      }
      setDisplay(result);
      setExpr("");
      setWaitingForOperand(true);
      return;
    }

    // Digits and decimal
    if (display === "Math ERROR" || display === "Syntax ERROR") {
      setDisplay(label === "." ? "0." : label);
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay(label === "." ? "0." : label);
      setWaitingForOperand(false);
    } else {
      setDisplay(d => {
        if (d === "0" && label !== ".") return label;
        if (label === "." && d.includes(".")) return d;
        return d + label;
      });
    }
  }

  function handleShift(label) {
    setShiftActive(false);
    handleButton(label);
  }

  function handleAlpha(label) {
    setAlphaActive(false);
    handleButton(label);
  }

  const isError = display === "Math ERROR" || display === "Syntax ERROR";

  // Truncate display for long numbers
  const displayText = display.length > 14 ? display.slice(0, 14) + "…" : display;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #1a237e 0%, #0d1554 100%)",
        borderRadius: 16,
        padding: "12px 10px 14px",
        width: "100%",
        maxWidth: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        fontFamily: "'Inter', sans-serif",
        border: "1px solid #2a3a8a",
        position: "relative",
      }}
    >
      {/* Header: CASIO branding + close */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: 2, fontFamily: "serif" }}>CASIO</div>
          <div style={{ color: "#90caf9", fontSize: 7.5, letterSpacing: 1, marginTop: -2 }}>fx-991ZA PLUS II</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Solar panel decoration */}
          <div style={{ display: "flex", gap: 2 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ width: 10, height: 18, background: "#1a1a2e", borderRadius: 2, border: "1px solid #333" }} />
            ))}
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* LCD Display */}
      <div style={{
        background: "#c8d8a0",
        borderRadius: 6,
        border: "3px solid #8a9a60",
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1)",
        padding: "6px 8px 8px",
        marginBottom: 8,
        minHeight: 68,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Status indicators */}
        <div style={{ display: "flex", gap: 6, marginBottom: 2, alignItems: "center" }}>
          {shiftActive && <span style={{ fontSize: 9, color: "#e67e00", fontWeight: 700, border: "1px solid #e67e00", padding: "0 3px", borderRadius: 2 }}>S</span>}
          {alphaActive && <span style={{ fontSize: 9, color: "#c00", fontWeight: 700, border: "1px solid #c00", padding: "0 3px", borderRadius: 2 }}>A</span>}
          <span style={{ fontSize: 9, color: "#2d4a1a", fontWeight: 600 }}>{isDeg ? "D" : "R"}</span>
          <span style={{ fontSize: 8, color: "#2d4a1a", marginLeft: "auto" }}>NATURAL-V.P.A.M.</span>
        </div>

        {/* Expression row */}
        {expr && (
          <div style={{ fontSize: 10, color: "#4a6a1a", textAlign: "right", marginBottom: 2, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {expr}
          </div>
        )}

        {/* Main display */}
        <div style={{
          fontSize: isError ? 14 : Math.min(28, 28 - Math.max(0, display.length - 8) * 1.5),
          fontWeight: 700,
          fontFamily: "monospace",
          textAlign: "right",
          color: isError ? "#cc0000" : "#1a2e0a",
          letterSpacing: 1,
          lineHeight: 1.1,
        }}>
          {displayText}
        </div>

        {/* Ans indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 8, color: "#4a6a1a" }}>Ans={lastAns.length > 10 ? lastAns.slice(0,10)+"…" : lastAns}</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

        {/* Row 0: SHIFT ALPHA ← → MODE ON */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
          <CalcBtn label="SHIFT" color="shift" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="ALPHA" color="alpha" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="←" color="nav" onClick={() => {}} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="→" color="nav" onClick={() => {}} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="MODE" shiftLabel="SETUP" color="light" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="ON" color="ac" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

        {/* Row 1: x² √ x⁻¹ log ln ( */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
          <CalcBtn label="x²" shiftLabel="√" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="xʸ" shiftLabel="ˣ√y" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="x⁻¹" shiftLabel="x!" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="log" shiftLabel="10ˣ" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="ln" shiftLabel="eˣ" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="√" shiftLabel="∛" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

        {/* Row 2: sin cos tan ENG ( ) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
          <CalcBtn label="sin" shiftLabel="sin⁻¹" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="cos" shiftLabel="cos⁻¹" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="tan" shiftLabel="tan⁻¹" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="EXP" shiftLabel="π" color="default" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="(" shiftLabel="[" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label=")" shiftLabel="]" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

        {/* Row 3: S↔D Abs % , RCL DEL */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
          <CalcBtn label="Ans" shiftLabel="Rnd" alphaLabel="π" color="light" onClick={handleButton} onShiftClick={handleShift} onAlphaClick={handleAlpha} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="Abs" color="light" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="%" color="light" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="e" shiftLabel="ENG" color="light" onClick={handleButton} onShiftClick={handleShift} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="DEL" shiftLabel="INS" color="del" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="AC" color="ac" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "1px 0" }} />

        {/* Row 4: 7 8 9 DEL AC */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) 2fr", gap: 3 }}>
          <CalcBtn label="7" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="8" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="9" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="÷" color="op" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="×" color="op" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

        {/* Row 5: 4 5 6 × */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) 2fr", gap: 3 }}>
          <CalcBtn label="4" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="5" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="6" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="+" color="op" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="−" color="op" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

        {/* Row 6: 1 2 3 + */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) 1fr 2fr", gap: 3 }}>
          <CalcBtn label="1" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="2" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="3" color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="(−)" color="light" onClick={() => handleButton("−")} shiftActive={shiftActive} alphaActive={alphaActive} />
          {/* = button — tall spanning 2 visual rows via taller height */}
          <div style={{ gridRow: "span 1" }}>
            <CalcBtn label="=" color="equals" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          </div>
        </div>

        {/* Row 7: 0 . EXP = */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", gap: 3 }}>
          <CalcBtn label="0" color="default" wide onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="." color="default" onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="×10ˣ" color="light" onClick={() => handleButton("EXP")} shiftActive={shiftActive} alphaActive={alphaActive} />
          <CalcBtn label="=" color="equals" wide onClick={handleButton} shiftActive={shiftActive} alphaActive={alphaActive} />
        </div>

      </div>

      {/* Bottom label */}
      <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,0.25)", fontSize: 8, letterSpacing: 1 }}>
        NATURAL-V.P.A.M. · {isDeg ? "DEGREE" : "RADIAN"}
      </div>
    </div>
  );
}