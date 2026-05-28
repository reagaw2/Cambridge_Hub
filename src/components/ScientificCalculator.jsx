import { useState, useCallback } from "react";
import { X } from "lucide-react";

const BUTTONS = [
  ["AC", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

const SCI_BUTTONS = [
  ["sin", "cos", "tan", "π"],
  ["sin⁻¹", "cos⁻¹", "tan⁻¹", "e"],
  ["xⁿ", "√x", "log", "ln"],
  ["x²", "1/x", "(", ")"],
  ["EXP", "!", "Ans", "°↔rad"],
];

function safeEval(expr) {
  try {
    // Replace display symbols with JS operators
    let e = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E))
      .replace(/sin⁻¹\(/g, "Math.asin(")
      .replace(/cos⁻¹\(/g, "Math.acos(")
      .replace(/tan⁻¹\(/g, "Math.atan(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/\^/g, "**");

    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + e + ")")();
    if (!isFinite(result)) return "Error";
    // Round to avoid floating point noise
    const rounded = parseFloat(result.toPrecision(12));
    return String(rounded);
  } catch {
    return "Error";
  }
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export default function ScientificCalculator({ onClose }) {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [lastAns, setLastAns] = useState("0");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isDeg, setIsDeg] = useState(true); // degrees vs radians

  const toRad = useCallback((v) => isDeg ? (v * Math.PI) / 180 : v, [isDeg]);
  const fromRad = useCallback((v) => isDeg ? (v * 180) / Math.PI : v, [isDeg]);

  function handleButton(label) {
    if (label === "AC") {
      setDisplay("0"); setExpr(""); setWaitingForOperand(false); return;
    }
    if (label === "±") {
      setDisplay(d => d.startsWith("-") ? d.slice(1) : "-" + d); return;
    }
    if (label === "%") {
      setDisplay(d => String(parseFloat(d) / 100)); return;
    }
    if (label === "⌫") {
      setDisplay(d => d.length > 1 ? d.slice(0, -1) : "0"); return;
    }
    if (label === "°↔rad") {
      setIsDeg(d => !d); return;
    }
    if (label === "Ans") {
      setDisplay(lastAns); setWaitingForOperand(false); return;
    }

    // Scientific functions
    const sciOps = ["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "√x", "log", "ln", "x²", "1/x", "!"];
    if (sciOps.includes(label)) {
      const val = parseFloat(display);
      let result;
      if (label === "sin") result = Math.sin(toRad(val));
      else if (label === "cos") result = Math.cos(toRad(val));
      else if (label === "tan") result = Math.tan(toRad(val));
      else if (label === "sin⁻¹") result = fromRad(Math.asin(val));
      else if (label === "cos⁻¹") result = fromRad(Math.acos(val));
      else if (label === "tan⁻¹") result = fromRad(Math.atan(val));
      else if (label === "√x") result = Math.sqrt(val);
      else if (label === "log") result = Math.log10(val);
      else if (label === "ln") result = Math.log(val);
      else if (label === "x²") result = val * val;
      else if (label === "1/x") result = 1 / val;
      else if (label === "!") result = factorial(Math.round(val));
      const str = isFinite(result) ? String(parseFloat(result.toPrecision(12))) : "Error";
      setDisplay(str); setWaitingForOperand(true); return;
    }

    // Constants
    if (label === "π") { setDisplay(String(Math.PI)); setWaitingForOperand(false); return; }
    if (label === "e") { setDisplay(String(Math.E)); setWaitingForOperand(false); return; }

    // Operators that build an expression
    if (["+", "−", "×", "÷"].includes(label)) {
      setExpr(display + " " + label + " ");
      setWaitingForOperand(true);
      return;
    }

    if (label === "xⁿ") {
      setExpr(display + "^");
      setWaitingForOperand(true);
      return;
    }

    if (label === "EXP") {
      setExpr(display + "×10^");
      setWaitingForOperand(true);
      return;
    }

    if (label === "(") {
      setExpr(e => e + "(");
      setDisplay("0");
      setWaitingForOperand(true);
      return;
    }

    if (label === ")") {
      const full = expr + display + ")";
      const result = safeEval(full);
      setDisplay(result);
      setExpr(full);
      setWaitingForOperand(true);
      return;
    }

    if (label === "=") {
      const full = expr + display;
      const result = safeEval(full);
      setLastAns(result === "Error" ? lastAns : result);
      setDisplay(result);
      setExpr("");
      setWaitingForOperand(true);
      return;
    }

    // Digits and decimal
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

  const btnBase = "flex items-center justify-center rounded-xl text-sm font-semibold h-10 active:scale-95 transition-all select-none cursor-pointer";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Calculator</p>
          <p className="text-[10px] text-muted-foreground/50">{isDeg ? "DEG" : "RAD"} mode</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Display */}
      <div className="px-4 py-3 bg-secondary/40 border-b border-border/30 space-y-0.5">
        {expr && (
          <p className="text-[11px] text-muted-foreground/60 font-mono text-right truncate">{expr}</p>
        )}
        <p className="text-2xl font-bold font-mono text-foreground text-right truncate">
          {display}
        </p>
      </div>

      <div className="p-2 space-y-1.5">
        {/* Scientific row */}
        <div className="grid grid-cols-5 gap-1">
          {SCI_BUTTONS.flat().map((label) => (
            <button
              key={label}
              onClick={() => handleButton(label)}
              className={`${btnBase} bg-secondary/60 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground ${
                label === "°↔rad" ? "text-primary/80 bg-primary/10 hover:bg-primary/20" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-px bg-border/40" />

        {/* Standard buttons */}
        {BUTTONS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-4 gap-1">
            {row.map((label) => {
              const isOp = ["÷", "×", "−", "+", "="].includes(label);
              const isAC = label === "AC";
              const isEquals = label === "=";
              return (
                <button
                  key={label}
                  onClick={() => handleButton(label)}
                  className={`${btnBase} ${
                    isEquals
                      ? "bg-primary text-primary-foreground hover:brightness-110"
                      : isOp
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : isAC
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-secondary text-foreground hover:brightness-110"
                  } ${label === "0" ? "" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}