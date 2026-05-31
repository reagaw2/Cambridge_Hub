import { useState } from "react";
import { X } from "lucide-react";

// ── Math engine ────────────────────────────────────────────────────────────────

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function factorial(n) {
  n = Math.round(n);
  if (n < 0 || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Evaluate a display expression string.
 * Returns { val: number } on success, { err: string } on math error, or null if expression is incomplete.
 */
function calcEval(expr, isDeg, ans) {
  if (!expr.trim()) return null;
  try {
    let e = expr
      .replace(/Ans/g, `(${ans})`)
      .replace(/π/g, String(Math.PI))
      .replace(/ℯ/g, String(Math.E))
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\^/g, "**");

    // Scientific notation: 5×10^3 → 5*(10**(3))
    e = e.replace(/\*10\*\*([+−\-]?\d+)/g, (_, exp) =>
      `*(10**(${exp.replace("−", "-")}))`
    );

    // Postfix operators — before function substitution
    e = e.replace(/(\d+(?:\.\d+)?)!/g, (_, n) => `__fact__(${n})`);
    e = e.replace(/(\d+(?:\.\d+)?)⁻¹/g, (_, n) => `(1/(${n}))`);

    // Functions — inverse trig FIRST to avoid double-replacement
    e = e
      .replace(/sin⁻¹\(/g,  "__asin__(")
      .replace(/cos⁻¹\(/g,  "__acos__(")
      .replace(/tan⁻¹\(/g,  "__atan__(")
      .replace(/sin\(/g,     "__sin__(")
      .replace(/cos\(/g,     "__cos__(")
      .replace(/tan\(/g,     "__tan__(")
      .replace(/log\(/g,     "Math.log10(")
      .replace(/ln\(/g,      "Math.log(")
      .replace(/√\(/g,       "Math.sqrt(")
      .replace(/∛\(/g,       "Math.cbrt(")
      .replace(/Abs\(/g,     "Math.abs(");

    const sinF  = isDeg ? x => Math.sin(x * D2R)  : Math.sin;
    const cosF  = isDeg ? x => Math.cos(x * D2R)  : Math.cos;
    const tanF  = isDeg ? x => Math.tan(x * D2R)  : Math.tan;
    const asinF = isDeg ? x => Math.asin(x) * R2D : Math.asin;
    const acosF = isDeg ? x => Math.acos(x) * R2D : Math.acos;
    const atanF = isDeg ? x => Math.atan(x) * R2D : Math.atan;

    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "__sin__", "__cos__", "__tan__",
      "__asin__", "__acos__", "__atan__",
      "__fact__",
      `"use strict"; return (${e});`
    );
    const r = fn(sinF, cosF, tanF, asinF, acosF, atanF, factorial);

    if (typeof r !== "number" || isNaN(r)) return { err: "Math Error" };
    if (!isFinite(r)) return { err: r > 0 ? "+∞" : "−∞" };
    return { val: r };
  } catch {
    return null; // incomplete — don't show error yet
  }
}

function fmtNum(n) {
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a < 1e-9 || a >= 1e11) {
    return n.toExponential(6)
      .replace("e+", "×10^")
      .replace("e-", "×10^−")
      .replace("e", "×10^");
  }
  return parseFloat(n.toPrecision(10)).toString();
}

// ── Button layout ────────────────────────────────────────────────────────────

// [label, action, value, colorKey, span?]
// colorKey: "orange" | "red" | "del" | "mode" | "op" | "num" | "fn" | "eq"

const BTN_ROWS = [
  // Row 0 — control
  ["SHIFT",  "noop",   null,   "orange"],
  ["ALPHA",  "noop",   null,   "red-l"],
  ["DEL",    "del",    null,   "del"],
  ["AC",     "clear",  null,   "red"],
  ["MODE",   "mode",   null,   "mode"],

  // Row 1 — powers + log
  ["x²",     "insert", "²",    "fn"],
  ["x^y",    "insert", "^",    "fn"],
  ["√(",     "insert", "√(",   "fn"],
  ["log(",   "insert", "log(", "fn"],
  ["ln(",    "insert", "ln(",  "fn"],

  // Row 2 — trig
  ["sin(",   "insert", "sin(", "fn"],
  ["cos(",   "insert", "cos(", "fn"],
  ["tan(",   "insert", "tan(", "fn"],
  ["(",      "insert", "(",    "fn"],
  [")",      "insert", ")",    "fn"],

  // Row 3 — inverse trig + constants
  ["sin⁻¹(", "insert", "sin⁻¹(", "fn"],
  ["cos⁻¹(", "insert", "cos⁻¹(", "fn"],
  ["tan⁻¹(", "insert", "tan⁻¹(", "fn"],
  ["π",      "insert", "π",   "fn"],
  ["ℯ",      "insert", "ℯ",   "fn"],

  // Row 4 — misc
  ["x⁻¹",   "insert", "⁻¹",  "fn"],
  ["x!",     "insert", "!",   "fn"],
  ["∛(",     "insert", "∛(",  "fn"],
  ["Ans",    "insert", "Ans", "fn"],
  ["÷",      "insert", "÷",   "op"],

  // Row 5 — 7 8 9
  ["7",      "insert", "7",   "num"],
  ["8",      "insert", "8",   "num"],
  ["9",      "insert", "9",   "num"],
  ["×",      "insert", "×",   "op"],
  ["−",      "insert", "−",   "op"],

  // Row 6 — 4 5 6
  ["4",      "insert", "4",   "num"],
  ["5",      "insert", "5",   "num"],
  ["6",      "insert", "6",   "num"],
  ["+",      "insert", "+",   "op"],
  ["EXP",    "insert", "×10^","fn"],

  // Row 7 — 1 2 3
  ["1",      "insert", "1",   "num"],
  ["2",      "insert", "2",   "num"],
  ["3",      "insert", "3",   "num"],
  [".",      "insert", ".",   "num"],
  ["0",      "insert", "0",   "num"],

  // Row 8 — bottom
  ["(−)",    "insert", "−",   "fn"],
  ["×10^",   "insert", "×10^","fn"],
  // = spans 3 columns
  ["=",      "equals", null,  "eq",  3],
];

const COL_COLORS = {
  orange: { bg: "#e07a10", text: "#000",  border: "#c06000" },
  "red-l":{ bg: "#b44040", text: "#fff",  border: "#922828" },
  del:    { bg: "#7a3800", text: "#fff",  border: "#5a2800" },
  red:    { bg: "#cc1111", text: "#fff",  border: "#aa0000" },
  mode:   { bg: "#1e2e82", text: "#fff",  border: "#141e60" },
  op:     { bg: "#38384a", text: "#fff",  border: "#5a5a70" },
  num:    { bg: "#22222e", text: "#fff",  border: "#3a3a4a" },
  fn:     { bg: "#2a2a40", text: "#d8d8ff", border: "#444460" },
  eq:     { bg: "#d07000", text: "#000",  border: "#a85000" },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ScientificCalculator({ onClose }) {
  const [expr,      setExpr]      = useState("");   // expression being built
  const [topLine,   setTopLine]   = useState("");   // top (small) display line
  const [mainLine,  setMainLine]  = useState("0");  // main (large) display line
  const [ans,       setAns]       = useState(0);
  const [isDeg,     setIsDeg]     = useState(true);
  const [justEvaled,setJustEvaled]= useState(false);
  const [isError,   setIsError]   = useState(false);

  /** Compute live preview while user is typing */
  function livePreview(e, deg, a) {
    if (!e) return "0";
    const res = calcEval(e, deg, a);
    if (!res) return e;          // incomplete — show expression
    if (res.err) return e;       // error — show expression
    return fmtNum(res.val);
  }

  function handleBtn(action, value) {
    switch (action) {
      case "noop": return;

      case "clear":
        setExpr(""); setTopLine(""); setMainLine("0");
        setIsError(false); setJustEvaled(false);
        return;

      case "del":
        if (justEvaled) {
          setExpr(""); setTopLine(""); setMainLine("0");
          setIsError(false); setJustEvaled(false);
          return;
        }
        {
          const ne = expr.slice(0, -1);
          setExpr(ne);
          setIsError(false);
          setMainLine(ne ? livePreview(ne, isDeg, ans) : "0");
        }
        return;

      case "mode":
        setIsDeg(d => !d);
        // Re-evaluate with new mode
        if (expr) setMainLine(livePreview(expr, !isDeg, ans));
        return;

      case "insert": {
        const OPERATORS = ["+", "−", "×", "÷", "^", "×10^"];
        let ne;
        if (justEvaled && !isError) {
          // After a result: operators continue with result, digits start fresh
          if (OPERATORS.includes(value)) {
            ne = fmtNum(ans) + value;
          } else {
            ne = value;
          }
          setJustEvaled(false);
        } else {
          ne = expr + value;
        }
        setExpr(ne);
        setIsError(false);
        setTopLine("");
        setMainLine(livePreview(ne, isDeg, ans));
        return;
      }

      case "equals": {
        const toEval = justEvaled && !isError ? fmtNum(ans) : expr;
        if (!toEval) return;
        const res = calcEval(toEval, isDeg, ans);
        if (!res) {
          setTopLine(toEval + " =");
          setMainLine("Syntax Error");
          setIsError(true);
          setJustEvaled(true);
          return;
        }
        if (res.err) {
          setTopLine(toEval + " =");
          setMainLine(res.err);
          setIsError(true);
          setJustEvaled(true);
          return;
        }
        const str = fmtNum(res.val);
        setTopLine(toEval + " =");
        setMainLine(str);
        setAns(res.val);
        setExpr(str);
        setIsError(false);
        setJustEvaled(true);
        return;
      }
    }
  }

  const mainFontSize = Math.max(14, Math.min(28, 28 - Math.max(0, mainLine.length - 10) * 1.5));

  return (
    <div
      className="select-none"
      style={{
        background: "linear-gradient(180deg, #1a237e 0%, #0d1554 100%)",
        borderRadius: 16,
        padding: "12px 10px 14px",
        width: "100%",
        maxWidth: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        fontFamily: "'Inter', 'JetBrains Mono', monospace",
        border: "1px solid #2a3a8a",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: 2, fontFamily: "serif" }}>CASIO</div>
          <div style={{ color: "#90caf9", fontSize: 7.5, letterSpacing: 1, marginTop: -2 }}>fx-991ZA PLUS II</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Solar cells decoration */}
          <div style={{ display: "flex", gap: 2 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ width: 10, height: 18, background: "#1a1a2e", borderRadius: 2, border: "1px solid #333" }} />
            ))}
          </div>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6, width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── LCD Display ── */}
      <div style={{
        background: "#c8d8a0",
        borderRadius: 6,
        border: "3px solid #8a9a60",
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1)",
        padding: "6px 10px 8px",
        marginBottom: 8,
        minHeight: 76,
      }}>
        {/* Mode + status row */}
        <div style={{ display: "flex", gap: 5, marginBottom: 2, alignItems: "center" }}>
          <span style={{
            fontSize: 9, color: "#2d4a1a", fontWeight: 700,
            border: "1px solid #2d4a1a", padding: "0 3px", borderRadius: 2,
          }}>
            {isDeg ? "D" : "R"}
          </span>
          {justEvaled && !isError && (
            <span style={{ fontSize: 8, color: "#2d4a1a", opacity: 0.7 }}>ANS</span>
          )}
          <span style={{ fontSize: 8, color: "#2d4a1a", marginLeft: "auto", opacity: 0.6 }}>
            NATURAL-V.P.A.M.
          </span>
        </div>

        {/* Top line — expression / history */}
        <div style={{
          fontSize: 10,
          color: "#4a6a1a",
          textAlign: "right",
          marginBottom: 2,
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minHeight: 14,
          opacity: topLine ? 1 : 0,
        }}>
          {topLine || "_"}
        </div>

        {/* Main display line */}
        <div style={{
          fontSize: mainFontSize,
          fontWeight: 700,
          fontFamily: "monospace",
          textAlign: "right",
          color: isError ? "#cc0000" : "#1a2e0a",
          letterSpacing: 0.5,
          lineHeight: 1.1,
          minHeight: 30,
        }}>
          {mainLine}
        </div>

        {/* Ans memory */}
        <div style={{ fontSize: 8, color: "#4a6a1a", marginTop: 2, opacity: 0.7 }}>
          Ans = {fmtNum(ans).slice(0, 14)}
        </div>
      </div>

      {/* ── Buttons ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
        {BTN_ROWS.map((btn, i) => {
          const [label, action, value, colorKey, span] = btn;
          const c = COL_COLORS[colorKey] ?? COL_COLORS.fn;
          const labelLen = (label ?? "").length;
          const fontSize = labelLen >= 7 ? 8 : labelLen >= 5 ? 9 : labelLen >= 3 ? 10 : 12;

          return (
            <button
              key={i}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleBtn(action, value)}
              style={{
                gridColumn: span ? `span ${span}` : undefined,
                background: `linear-gradient(180deg, ${c.bg}f0, ${c.bg}c0)`,
                border: `1px solid ${c.border}`,
                color: c.text,
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3px 2px",
                minHeight: 28,
                fontSize,
                fontWeight: 700,
                fontFamily: "monospace",
                letterSpacing: 0,
                boxShadow: "0 2px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
                transition: "filter 0.06s, transform 0.06s",
                touchAction: "manipulation",
              }}
              onTouchStart={e => {
                e.currentTarget.style.filter = "brightness(1.35)";
                e.currentTarget.style.transform = "translateY(1px)";
              }}
              onTouchEnd={e => {
                e.currentTarget.style.filter = "";
                e.currentTarget.style.transform = "";
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.2)"; }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = "";
                e.currentTarget.style.transform = "";
              }}
              onMouseDown2={e => { e.currentTarget.style.transform = "translateY(1px)"; }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", marginTop: 7,
        color: "rgba(255,255,255,0.2)", fontSize: 8, letterSpacing: 1,
      }}>
        NATURAL-V.P.A.M. · {isDeg ? "DEGREE" : "RADIAN"} · {fmtNum(ans).slice(0,14)}
      </div>
    </div>
  );
}