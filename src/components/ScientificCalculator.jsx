import { useState } from "react";
import { X } from "lucide-react";

// ── Math Engine ───────────────────────────────────────────────────────────────
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function fact(n) {
  n = Math.round(n);
  if (n < 0 || n > 170) return NaN;
  return n <= 1 ? 1 : n * fact(n - 1);
}
function nPr(n,r){n=Math.round(n);r=Math.round(r);return r<0||r>n?NaN:fact(n)/fact(n-r);}
function nCr(n,r){n=Math.round(n);r=Math.round(r);return r<0||r>n?NaN:fact(n)/(fact(r)*fact(n-r));}
function gcd(a,b){a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){const t=b;b=a%b;a=t;}return a;}
function lcm(a,b){const g=gcd(a,b);return g?Math.abs(a*b)/g:0;}

function evalExpr(expr, isDeg, ans) {
  if (!expr.trim()) return null;
  try {
    let e = expr
      .replace(/Ans/g, `(${ans})`)
      .replace(/π/g, Math.PI)
      .replace(/×/g, "*").replace(/÷/g, "/")
      .replace(/−/g, "-").replace(/\^/g, "**")
      .replace(/²/g, "**2").replace(/³/g, "**3").replace(/⁻¹/g, "**(-1)")
      .replace(/(\d+(?:\.\d+)?)!/g, (_,n) => `_f_(${n})`);

    [
      ["sin⁻¹(","_as_("],["cos⁻¹(","_ac_("],["tan⁻¹(","_at_("],
      ["sinh⁻¹(","_ash_("],["cosh⁻¹(","_ach_("],["tanh⁻¹(","_ath_("],
      ["sinh(","_sh_("],["cosh(","_ch_("],["tanh(","_th_("],
      ["sin(","_s_("],["cos(","_c_("],["tan(","_t_("],
      ["log(","Math.log10("],["ln(","Math.log("],["exp(","Math.exp("],
      ["√(","Math.sqrt("],["∛(","Math.cbrt("],["Abs(","Math.abs("],
      ["nPr","_nP_"],["nCr","_nC_"],
      ["GCD(","_gcd_("],["LCM(","_lcm_("],
    ].forEach(([f,t]) => { e = e.split(f).join(t); });

    const S  = isDeg ? x=>Math.sin(x*DEG)  : Math.sin;
    const C  = isDeg ? x=>Math.cos(x*DEG)  : Math.cos;
    const T  = isDeg ? x=>Math.tan(x*DEG)  : Math.tan;
    const aS = isDeg ? x=>Math.asin(x)*RAD : Math.asin;
    const aC = isDeg ? x=>Math.acos(x)*RAD : Math.acos;
    const aT = isDeg ? x=>Math.atan(x)*RAD : Math.atan;

    // eslint-disable-next-line no-new-func
    const v = new Function(
      "_s_","_c_","_t_","_as_","_ac_","_at_",
      "_sh_","_ch_","_th_","_ash_","_ach_","_ath_",
      "_f_","_nP_","_nC_","_gcd_","_lcm_",
      `"use strict"; return (${e});`
    )(S,C,T,aS,aC,aT,
      Math.sinh,Math.cosh,Math.tanh,Math.asinh,Math.acosh,Math.atanh,
      fact,nPr,nCr,gcd,lcm);

    if (typeof v !== "number" || isNaN(v)) return { err: "Math ERROR" };
    if (!isFinite(v)) return { err: v > 0 ? "+∞" : "−∞" };
    return { val: v };
  } catch { return null; }
}

function fmt(n) {
  if (typeof n !== "number") return "0";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a < 0.0001 || a >= 1e10) {
    return n.toExponential(6).replace("e+","×10^").replace("e-","×10^-");
  }
  return parseFloat(n.toPrecision(10)).toString();
}

// ── Color palette matching Casio fx-82ZA PLUS II ──────────────────────────────
const C = {
  def:  ["#2d2d2d","#1a1a1a","#ffffff"],   // [bg, shadow/border, text]
  fn:   ["#282828","#161616","#ffffff"],
  num:  ["#353535","#1e1e1e","#ffffff"],
  nav:  ["#20203a","#0e0e28","#7788ee"],
  navc: ["#1a1a32","#08082a","#99aaff"],
  shk:  ["#1c1c1c","#884400","#ff9900"],
  alk:  ["#1c1c1c","#880000","#ff4444"],
  del:  ["#1c5a1c","#0a2a0a","#ffffff"],
  ac:   ["#4a7200","#243a00","#ffffff"],
  eq:   ["#2d2d2d","#1a1a1a","#ffffff"],
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ScientificCalculator({ onClose }) {
  const [expr,     setExpr]     = useState("");
  const [topLine,  setTopLine]  = useState("");
  const [mainLine, setMainLine] = useState("0");
  const [ans,      setAns]      = useState(0);
  const [isDeg,    setIsDeg]    = useState(true);
  const [sh,       setSh]       = useState(false);
  const [hypOn,    setHypOn]    = useState(false);
  const [isErr,    setIsErr]    = useState(false);
  const [evaled,   setEvaled]   = useState(false);

  function preview(e) {
    if (!e) return "0";
    const r = evalExpr(e, isDeg, ans);
    if (!r || r.err) return e;
    return fmt(r.val);
  }

  function ins(str) {
    const binops = ["+","−","×","÷","^","nPr","nCr"];
    let ne;
    if (evaled && !isErr) {
      ne = binops.some(o => str.startsWith(o)) ? fmt(ans) + str : str;
      setEvaled(false);
    } else {
      ne = expr + str;
    }
    setExpr(ne); setIsErr(false);
    setTopLine(ne); setMainLine(preview(ne));
    setSh(false); setHypOn(false);
  }

  function doEq() {
    if (!expr) return;
    const r = evalExpr(expr, isDeg, ans);
    if (!r) { setTopLine(expr+"="); setMainLine("Syntax ERROR"); setIsErr(true); setEvaled(true); return; }
    if (r.err) { setTopLine(expr+"="); setMainLine(r.err); setIsErr(true); setEvaled(true); return; }
    const s = fmt(r.val);
    setTopLine(expr+"="); setMainLine(s); setAns(r.val); setExpr(s);
    setIsErr(false); setEvaled(true); setSh(false); setHypOn(false);
  }

  function doDel() {
    if (evaled) { setExpr(""); setTopLine(""); setMainLine("0"); setIsErr(false); setEvaled(false); return; }
    const ne = expr.slice(0, -1);
    setExpr(ne); setIsErr(false); setTopLine(ne); setMainLine(preview(ne));
  }

  function doAC() {
    setExpr(""); setTopLine(""); setMainLine("0");
    setIsErr(false); setEvaled(false); setSh(false); setHypOn(false);
  }

  // General button press
  function press(act, shAct) {
    const a = sh && shAct ? shAct : act;
    if (a !== "SHIFT") setSh(false);
    if (!a) return;
    switch(a) {
      case "SHIFT":  setSh(s => !s); setHypOn(false); break;
      case "ALPHA":  break;
      case "MODE":   setIsDeg(d => !d); break;
      case "ON": case "AC": doAC(); break;
      case "DEL":    doDel(); break;
      case "EQ":     doEq(); break;
      case "HYP":    setHypOn(h => !h); break;
      case "ANS":    ins("Ans"); break;
      case "π":      ins("π"); break;
      case "RAN":    ins(fmt(Math.random())); break;
      case "ENG":    { const ne = expr + "×10^"; setExpr(ne); setTopLine(ne); setMainLine(preview(ne)); break; }
      default:
        if (a.startsWith("I:")) ins(a.slice(2));
        break;
    }
  }

  // Trig buttons respect SHIFT (inverse) and HYP (hyperbolic)
  function pressTrig(main, inv, hM, hI) {
    if (sh && hypOn && hI) ins(hI);
    else if (sh && inv)    ins(inv);
    else if (hypOn && hM)  ins(hM);
    else                   ins(main);
    setSh(false); setHypOn(false);
  }

  const rsize = Math.max(12, Math.min(22, 22 - Math.max(0, mainLine.length - 7) * 1.3));
  const GAP = 2.5;

  // ── Button renderer ──────────────────────────────────────────────────────
  function Btn({ label, top, bot, act, sa, col = "def", span = 1, h = 27,
                 isTrig = false, tMain, tInv, tHyp, tHypI }) {
    const [bg, border, fg] = C[col] || C.def;
    const active = (col === "shk" && sh) || (col === "alk" && false) || (label === "HYP" && hypOn);

    const click = () => {
      if (isTrig) pressTrig(tMain, tInv, tHyp, tHypI);
      else press(act, sa);
    };

    const labelLen = (label||"").length;
    const lsize = labelLen >= 6 ? 7.5 : labelLen >= 4 ? 9 : labelLen >= 3 ? 10 : 11;

    return (
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={click}
        style={{
          gridColumn: `span ${span}`,
          background: bg,
          border: active ? `1.5px solid ${fg}` : `1px solid ${border}`,
          color: fg,
          borderRadius: 3,
          height: h,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 2.5px 0 ${border}, inset 0 1px 0 rgba(255,255,255,0.07)`,
          transition: "filter 0.06s",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
          padding: "1px 1px 2px",
          overflow: "hidden",
          minWidth: 0,
          position: "relative",
        }}
        onTouchStart={e => { e.currentTarget.style.filter = "brightness(1.7)"; e.currentTarget.style.transform = "translateY(1px)"; }}
        onTouchEnd={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
        onMouseDown2={e => { e.currentTarget.style.transform = "translateY(1px)"; }}
        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
      >
        {top && (
          <span style={{ fontSize: 6.5, color: "#ffcc00", lineHeight: 1, marginBottom: 0.5, whiteSpace: "nowrap", letterSpacing: 0.2 }}>
            {top}
          </span>
        )}
        <span style={{ fontSize: lsize, fontFamily: "monospace", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
          {label}
        </span>
        {bot && (
          <span style={{ fontSize: 6, color: "#88aaff", lineHeight: 1, marginTop: 0.5, whiteSpace: "nowrap" }}>
            {bot}
          </span>
        )}
      </button>
    );
  }

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "linear-gradient(175deg, #1e1e1e 0%, #141414 100%)",
        borderRadius: 14,
        padding: "8px 9px 11px",
        width: 296,
        boxShadow: "0 14px 44px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
        border: "1px solid #2e2e2e",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "2px 2px 0" }}>
        <div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "Georgia, serif", letterSpacing: 3, lineHeight: 1 }}>CASIO</div>
          <div style={{ color: "#777", fontSize: 8, letterSpacing: 0.8, marginTop: 1 }}>fx-82ZA PLUS II</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Solar cells */}
          <div style={{ display: "flex", gap: 1.5, marginTop: 2 }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ width: 8, height: 15, background: "#111", border: "1px solid #2a2a2a", borderRadius: 1 }} />
            ))}
          </div>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={onClose}
            style={{ background: "#2a2a2a", border: "1px solid #444", borderRadius: 4, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#aaa" }}
          >
            <X size={11} />
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#555", fontSize: 7.5, letterSpacing: 2.5, margin: "4px 0 6px", fontStyle: "italic" }}>
        NATURAL-V.P.A.M.
      </div>

      {/* ── LCD Display ── */}
      <div style={{
        background: "linear-gradient(180deg, #b8c870 0%, #c8d878 40%, #bcc868 100%)",
        borderRadius: 5,
        border: "3px solid #7a8e3a",
        boxShadow: "inset 0 3px 10px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.08)",
        padding: "4px 8px 5px",
        marginBottom: 7,
        minHeight: 82,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Scanline texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(180deg,transparent,transparent 10px,rgba(0,0,0,0.03) 10px,rgba(0,0,0,0.03) 11px)", pointerEvents: "none" }} />

        {/* Status row */}
        <div style={{ display: "flex", gap: 4, marginBottom: 3, position: "relative" }}>
          {sh && <span style={{ fontSize: 8, background: "#4a5820", color: "#c8d878", borderRadius: 2, padding: "0 3px", fontWeight: 700, lineHeight: 1.5 }}>S</span>}
          {hypOn && <span style={{ fontSize: 8, background: "#4a5820", color: "#c8d878", borderRadius: 2, padding: "0 3px", fontWeight: 700, lineHeight: 1.5 }}>HYP</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {evaled && !isErr && <span style={{ fontSize: 8, color: "#3a4c10", fontWeight: 700 }}>Ans</span>}
            <span style={{ fontSize: 8, background: "#4a5820", color: "#c8d878", borderRadius: 2, padding: "0 3px", fontWeight: 700, lineHeight: 1.5 }}>
              {isDeg ? "D" : "R"}
            </span>
          </div>
        </div>

        {/* Expression line (small, top) */}
        <div style={{
          fontSize: 9.5, color: "#3a4c10", textAlign: "right", fontFamily: "monospace",
          minHeight: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", position: "relative",
        }}>
          {topLine || "\u00a0"}
        </div>

        {/* Result line (large, main) */}
        <div style={{
          fontSize: rsize, fontWeight: 700, fontFamily: "monospace",
          textAlign: "right", color: isErr ? "#cc2222" : "#1a2a06",
          minHeight: 30, display: "flex", alignItems: "center", justifyContent: "flex-end",
          lineHeight: 1, letterSpacing: 0.5, position: "relative",
        }}>
          {mainLine}
        </div>

        {/* Ans memory */}
        <div style={{ fontSize: 7.5, color: "#4a5820", textAlign: "right", opacity: 0.75, position: "relative", marginTop: 1 }}>
          Ans={fmt(ans).slice(0, 13)}
        </div>
      </div>

      {/* ── NAV SECTION: Row 1 (5 wide) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="SHIFT" col="shk" act="SHIFT" />
        <Btn label="ALPHA" col="alk" act="ALPHA" />
        <Btn label="▲"     col="nav" act={null}  />
        <Btn label="SETUP" top="MODE" col="def" act="MODE" />
        <Btn label="ON"    col="def" act="ON"   />
      </div>

      {/* ── NAV SECTION: Row 2 (5 wide) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="Abs"   top="÷R"  bot="A"  col="fn"   act="I:Abs(" sa="I:÷" />
        <Btn label="◄"     col="nav" act={null} />
        <Btn label="●"     col="navc" act={null} />
        <Btn label="►"     col="nav" act={null} />
        <Btn label="x⁻¹"  top={null} bot={null} col="fn" act="I:⁻¹" />
      </div>

      {/* ── NAV SECTION: Row 3 (5 wide) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP, marginBottom: 5 }}>
        <Btn label="x³"   top="■■" bot="C"  col="fn"  act="I:³"    sa="I:∛(" />
        <Btn label="▼"    col="nav" act={null} />
        <div />
        <div />
        <Btn label="log□" top={null} bot={null} col="fn" act="I:log(" />
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 4, background: "#111", borderRadius: 2, marginBottom: 5 }} />

      {/* ── FUNCTION SECTION: Row F1 — √ x² x^y 10ˣ log ln (6 wide) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="√□"   top="■■■" bot={null} col="fn"  act="I:√("   sa="I:√("  />
        <Btn label="x²"   top="■■"  bot={null} col="fn"  act="I:²"    sa="I:³"   />
        <Btn label="x^□"  top={null} bot={null} col="fn" act="I:^"                />
        <Btn label="10ˣ"  top="BIN" bot={null} col="fn"  act="I:10^("             />
        <Btn label="log"  top="OCT" bot={null} col="fn"  act="I:log("  sa="I:10^(" />
        <Btn label="ln"   top={null} bot={null} col="fn" act="I:ln("   sa="I:exp(" />
      </div>

      {/* ── FUNCTION SECTION: Row F2 — (-) CALC HYP sin cos tan ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="(-)"  top="FACT" bot="A"  col="fn" act="I:−(" sa="I:!" />
        <Btn label="CALC" top={null} bot={null} col="fn" act={null} />
        <Btn label="HYP"  top={null} bot={null} col={hypOn ? "shk" : "fn"} act="HYP" />
        <Btn label="sin"  top="A₁"  bot="B"   col="fn"
             isTrig tMain="sin(" tInv="sin⁻¹(" tHyp="sinh(" tHypI="sinh⁻¹(" />
        <Btn label="cos"  top="E₁"  bot={null} col="fn"
             isTrig tMain="cos(" tInv="cos⁻¹(" tHyp="cosh(" tHypI="cosh⁻¹(" />
        <Btn label="tan"  top="F"   bot={null} col="fn"
             isTrig tMain="tan(" tInv="tan⁻¹(" tHyp="tanh(" tHypI="tanh⁻¹(" />
      </div>

      {/* ── FUNCTION SECTION: Row F3 — RCL ENG ( ) S⟺D M+ ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="RCL"   top="STO"  bot={null}  col="fn" act="ANS"     sa="I:Ans→" />
        <Btn label="ENG"   top={null} bot={null}  col="fn" act="ENG"                  />
        <Btn label="("     top="Abs"  bot={null}  col="fn" act="I:("      sa="I:Abs(" />
        <Btn label=")"     top={null} bot={null}  col="fn" act="I:)"                  />
        <Btn label="S⟺D"  top={null} bot={null}  col="fn" act={null}                 />
        <Btn label="M+"    top="M−"   bot="M"     col="fn" act={null}                 />
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 4, background: "#111", borderRadius: 2, marginBottom: 5 }} />

      {/* ── NUMBER SECTION: Row N1 — 7 8 9 DEL AC (5 wide) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="7"   top="Pol"  bot={null}  col="num" act="I:7" h={30} />
        <Btn label="8"   top="Rec"  bot={null}  col="num" act="I:8" h={30} />
        <Btn label="9"   top="GCD"  bot={null}  col="num" act="I:9" sa="I:GCD(" h={30} />
        <Btn label="DEL" top="INS"  bot={null}  col="del" act="DEL" h={30} />
        <Btn label="AC"  top="OFF"  bot={null}  col="ac"  act="AC"  h={30} />
      </div>

      {/* ── NUMBER SECTION: Row N2 — 4 5 6 × ÷ ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="4"  top="r"    bot="STAT" col="num" act="I:4"  h={30} />
        <Btn label="5"  top={null} bot={null} col="num" act="I:5"  h={30} />
        <Btn label="6"  top={null} bot={null} col="num" act="I:6"  h={30} />
        <Btn label="×"  top="nPr"  bot={null} col="fn"  act="I:×"  sa="I:nPr" h={30} />
        <Btn label="÷"  top="nCr"  bot="LCM"  col="fn" act="I:÷"  sa="I:nCr" h={30} />
      </div>

      {/* ── NUMBER SECTION: Row N3 — 1 2 3 + − ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP, marginBottom: GAP }}>
        <Btn label="1"  top="Rnd"  bot={null}  col="num" act="I:1"  sa="RAN"  h={30} />
        <Btn label="2"  top="Ran#" bot={null}  col="num" act="I:2"            h={30} />
        <Btn label="3"  top="π"    bot="BASE"  col="num" act="I:3"  sa="π"    h={30} />
        <Btn label="+"  top={null} bot="Pol"   col="fn"  act="I:+"            h={30} />
        <Btn label="−"  top="Rec"  bot={null}  col="fn"  act="I:−"            h={30} />
      </div>

      {/* ── NUMBER SECTION: Row N4 — 0 , ×10ˣ Ans = ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: GAP }}>
        <Btn label="0"     top={null}    bot={null}      col="num" act="I:0"    h={30} />
        <Btn label=","     top={null}    bot={null}      col="num" act="I:,"    h={30} />
        <Btn label="×10ˣ" top={null}    bot={null}      col="fn"  act="I:×10^" h={30} />
        <Btn label="Ans"   top="DRG▶"   bot="ProAns"    col="fn"  act="ANS"    h={30} />
        <Btn label="="     top={null}    bot={null}      col="eq"  act="EQ"     h={30} />
      </div>
    </div>
  );
}