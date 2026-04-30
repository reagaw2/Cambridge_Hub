/**
 * MockQuestionDisplay — renders a single question's content.
 * Fixes:
 *   1. Markdown pipe tables parsed into real HTML tables
 *   2. Diagram SVGs rendered from hardcoded lookup by question_id
 */
import MockGraphRenderer from "./MockGraphRenderer";
import MarkdownText from "./MarkdownText";

// ─── Hardcoded SVG diagrams keyed by question_id ───────────────────────────
const DIAGRAM_SVGS = {
  "ala-mock-2026-p4-Q2ci1": `<svg width="100%" viewBox="0 0 500 140" role="img"><title>Cylinder heating diagram</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="20" y="30" width="160" height="80" rx="8" fill="none" stroke="#888" stroke-width="1.5"/><text x="100" y="62" text-anchor="middle" font-size="13" fill="currentColor">4.7 × 10⁴ cm³</text><text x="100" y="80" text-anchor="middle" font-size="13" fill="currentColor">2.6 × 10⁵ Pa</text><text x="100" y="98" text-anchor="middle" font-size="13" fill="currentColor">173 °C</text><line x1="180" y1="70" x2="310" y2="70" stroke="#555" stroke-width="1.5" marker-end="url(#a)"/><text x="245" y="60" text-anchor="middle" font-size="13" fill="currentColor">2900 J</text><rect x="320" y="30" width="160" height="80" rx="8" fill="none" stroke="#888" stroke-width="1.5"/><text x="400" y="62" text-anchor="middle" font-size="13" fill="currentColor">4.7 × 10⁴ cm³</text><text x="400" y="80" text-anchor="middle" font-size="13" fill="currentColor">p</text><text x="400" y="98" text-anchor="middle" font-size="13" fill="currentColor">T</text></svg>`,
  "ala-mock-2026-p4-Q3bi": `<svg width="100%" viewBox="0 0 420 220" role="img"><title>Specific latent heat apparatus</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="120" y="80" width="100" height="80" rx="4" fill="none" stroke="#888" stroke-width="1.5"/><rect x="140" y="95" width="60" height="50" rx="2" fill="none" stroke="#aaa" stroke-width="1" stroke-dasharray="4 2"/><text x="170" y="125" text-anchor="middle" font-size="11" fill="currentColor">liquid</text><rect x="125" y="130" width="90" height="20" rx="2" fill="none" stroke="#888" stroke-width="1"/><text x="170" y="143" text-anchor="middle" font-size="10" fill="currentColor">heater</text><rect x="100" y="168" width="140" height="8" rx="2" fill="none" stroke="#888" stroke-width="1"/><text x="170" y="194" text-anchor="middle" font-size="11" fill="currentColor">pan of balance</text><circle cx="240" cy="70" r="14" fill="none" stroke="#888" stroke-width="1.5"/><text x="240" y="74" text-anchor="middle" font-size="11" font-weight="500" fill="currentColor">V</text><line x1="220" y1="70" x2="195" y2="90" stroke="#888" stroke-width="1.2"/><circle cx="300" cy="70" r="14" fill="none" stroke="#888" stroke-width="1.5"/><text x="300" y="74" text-anchor="middle" font-size="11" font-weight="500" fill="currentColor">A</text><line x1="285" y1="70" x2="260" y2="70" stroke="#888" stroke-width="1"/><line x1="195" y1="55" x2="195" y2="90" stroke="#555" stroke-width="1.5"/><line x1="170" y1="42" x2="310" y2="42" stroke="#555" stroke-width="1.5"/><line x1="310" y1="42" x2="310" y2="75" stroke="#555" stroke-width="1.5"/><text x="175" y="36" font-size="11" fill="currentColor">+</text><text x="305" y="36" font-size="11" fill="currentColor">−</text></svg>`,
  "ala-mock-2026-p4-Q4bi": `<svg width="100%" viewBox="0 0 440 200" role="img"><title>Metal strip SHM diagram</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="20" y="55" width="40" height="50" rx="3" fill="none" stroke="#888" stroke-width="1.5"/><text x="40" y="84" text-anchor="middle" font-size="10" fill="currentColor">clamp</text><path d="M60 78 Q180 78 300 108" fill="none" stroke="#555" stroke-width="2"/><path d="M60 78 Q180 78 300 78" fill="none" stroke="#aaa" stroke-width="1" stroke-dasharray="5 3"/><rect x="292" y="95" width="30" height="30" rx="3" fill="none" stroke="#888" stroke-width="1.5"/><text x="307" y="114" text-anchor="middle" font-size="10" fill="currentColor">M</text><line x1="330" y1="79" x2="330" y2="110" stroke="#888" stroke-width="1" stroke-dasharray="3 2"/><line x1="325" y1="79" x2="335" y2="79" stroke="#888" stroke-width="1"/><line x1="325" y1="110" x2="335" y2="110" stroke="#888" stroke-width="1"/><text x="340" y="96" font-size="11" fill="currentColor">s</text><text x="150" y="145" text-anchor="middle" font-size="11" fill="currentColor">metal strip</text></svg>`,
  "ala-mock-2026-p4-Q5b": `<svg width="100%" viewBox="0 0 400 130" role="img"><title>Two charged spheres X and Y with point P</title><circle cx="80" cy="65" r="40" fill="none" stroke="#888" stroke-width="1.5"/><text x="80" y="60" text-anchor="middle" font-size="14" font-weight="500" fill="currentColor">X</text><circle cx="320" cy="65" r="40" fill="none" stroke="#888" stroke-width="1.5"/><text x="320" y="60" text-anchor="middle" font-size="14" font-weight="500" fill="currentColor">Y</text><line x1="120" y1="65" x2="280" y2="65" stroke="#aaa" stroke-width="1" stroke-dasharray="4 3"/><circle cx="190" cy="65" r="4" fill="#555"/><text x="190" y="55" text-anchor="middle" font-size="12" fill="currentColor">P</text></svg>`,
  "ala-mock-2026-p4-Q6bi": `<svg width="100%" viewBox="0 0 360 90" role="img"><title>Three capacitors in series: 4uF, 4uF, 8uF</title><line x1="20" y1="45" x2="60" y2="45" stroke="#888" stroke-width="1.5"/><line x1="60" y1="30" x2="60" y2="60" stroke="#555" stroke-width="2.5"/><line x1="70" y1="30" x2="70" y2="60" stroke="#555" stroke-width="2.5"/><text x="65" y="22" text-anchor="middle" font-size="11" fill="currentColor">4 μF</text><line x1="70" y1="45" x2="150" y2="45" stroke="#888" stroke-width="1.5"/><line x1="150" y1="30" x2="150" y2="60" stroke="#555" stroke-width="2.5"/><line x1="160" y1="30" x2="160" y2="60" stroke="#555" stroke-width="2.5"/><text x="155" y="22" text-anchor="middle" font-size="11" fill="currentColor">4 μF</text><line x1="160" y1="45" x2="240" y2="45" stroke="#888" stroke-width="1.5"/><line x1="240" y1="30" x2="240" y2="60" stroke="#555" stroke-width="2.5"/><line x1="250" y1="30" x2="250" y2="60" stroke="#555" stroke-width="2.5"/><text x="245" y="22" text-anchor="middle" font-size="11" fill="currentColor">8 μF</text><line x1="250" y1="45" x2="340" y2="45" stroke="#888" stroke-width="1.5"/><text x="180" y="78" text-anchor="middle" font-size="11" fill="currentColor">Total = 1.6 μF (all in series)</text></svg>`,
  "ala-mock-2026-p4-Q6bii": `<svg width="100%" viewBox="0 0 360 160" role="img"><title>Capacitor circuit: 8uF parallel with two 4uF in series</title><line x1="20" y1="40" x2="60" y2="40" stroke="#888" stroke-width="1.5"/><line x1="60" y1="40" x2="60" y2="120" stroke="#888" stroke-width="1.5"/><line x1="60" y1="40" x2="180" y2="40" stroke="#888" stroke-width="1.5"/><line x1="60" y1="120" x2="180" y2="120" stroke="#888" stroke-width="1.5"/><line x1="100" y1="25" x2="100" y2="55" stroke="#555" stroke-width="2.5"/><line x1="110" y1="25" x2="110" y2="55" stroke="#555" stroke-width="2.5"/><text x="105" y="17" text-anchor="middle" font-size="11" fill="currentColor">8 μF</text><line x1="100" y1="40" x2="60" y2="40" stroke="#888" stroke-width="1.5"/><line x1="110" y1="40" x2="180" y2="40" stroke="#888" stroke-width="1.5"/><line x1="180" y1="40" x2="180" y2="80" stroke="#888" stroke-width="1.5"/><line x1="165" y1="80" x2="165" y2="110" stroke="#555" stroke-width="2.5"/><line x1="175" y1="80" x2="175" y2="110" stroke="#555" stroke-width="2.5"/><text x="195" y="98" font-size="11" fill="currentColor">4 μF</text><line x1="180" y1="120" x2="180" y2="110" stroke="#888" stroke-width="1.5"/><line x1="230" y1="80" x2="230" y2="110" stroke="#555" stroke-width="2.5"/><line x1="220" y1="80" x2="220" y2="110" stroke="#555" stroke-width="2.5"/><text x="245" y="98" font-size="11" fill="currentColor">4 μF</text><line x1="200" y1="95" x2="218" y2="95" stroke="#888" stroke-width="1.5"/><line x1="180" y1="80" x2="200" y2="80" stroke="#888" stroke-width="1.5"/><line x1="230" y1="80" x2="300" y2="80" stroke="#888" stroke-width="1.5"/><line x1="300" y1="80" x2="300" y2="120" stroke="#888" stroke-width="1.5"/><line x1="180" y1="120" x2="340" y2="120" stroke="#888" stroke-width="1.5"/><line x1="340" y1="40" x2="340" y2="120" stroke="#888" stroke-width="1.5"/><line x1="180" y1="40" x2="340" y2="40" stroke="#888" stroke-width="1.5"/><text x="180" y="150" text-anchor="middle" font-size="11" fill="currentColor">Total = 10 μF (8μF ∥ series 4+4)</text></svg>`,
  "ala-mock-2026-p4-Q6c": `<svg width="100%" viewBox="0 0 400 130" role="img"><title>Bridge rectifier circuit with capacitor C and resistor R</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><circle cx="50" cy="65" r="22" fill="none" stroke="#888" stroke-width="1.5"/><text x="44" y="62" font-size="10" fill="currentColor">~</text><line x1="28" y1="58" x2="10" y2="58" stroke="#888" stroke-width="1.2"/><line x1="28" y1="72" x2="10" y2="72" stroke="#888" stroke-width="1.2"/><rect x="100" y="40" width="90" height="50" rx="6" fill="none" stroke="#888" stroke-width="1.5" stroke-dasharray="5 3"/><text x="145" y="68" text-anchor="middle" font-size="11" fill="currentColor">bridge</text><text x="145" y="82" text-anchor="middle" font-size="11" fill="currentColor">rectifier</text><line x1="72" y1="58" x2="100" y2="58" stroke="#888" stroke-width="1.2"/><line x1="72" y1="72" x2="100" y2="72" stroke="#888" stroke-width="1.2"/><line x1="190" y1="40" x2="250" y2="40" stroke="#888" stroke-width="1.2"/><line x1="190" y1="90" x2="250" y2="90" stroke="#888" stroke-width="1.2"/><line x1="250" y1="30" x2="250" y2="55" stroke="#555" stroke-width="2.5"/><line x1="260" y1="30" x2="260" y2="55" stroke="#555" stroke-width="2.5"/><text x="255" y="22" text-anchor="middle" font-size="11" fill="currentColor">C  47μF</text><line x1="255" y1="55" x2="255" y2="90" stroke="#888" stroke-width="1.2"/><line x1="255" y1="30" x2="255" y2="40" stroke="#888" stroke-width="1.2"/><line x1="310" y1="40" x2="310" y2="90" stroke="#555" stroke-width="2.5"/><line x1="270" y1="40" x2="310" y2="40" stroke="#888" stroke-width="1.2"/><line x1="270" y1="90" x2="310" y2="90" stroke="#888" stroke-width="1.2"/><text x="318" y="70" font-size="12" fill="currentColor">R</text></svg>`,
  "ala-mock-2026-p4-Q7a": `<svg width="100%" viewBox="0 0 400 200" role="img"><title>Electron path in magnetic field into page</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="180" y="40" width="120" height="120" rx="4" fill="#f0f0f0" stroke="#888" stroke-width="1.5"/><text x="240" y="80" text-anchor="middle" font-size="10" fill="#555">× × × × ×</text><text x="240" y="95" text-anchor="middle" font-size="10" fill="#555">× × × × ×</text><text x="240" y="110" text-anchor="middle" font-size="10" fill="#555">× × × × ×</text><text x="240" y="125" text-anchor="middle" font-size="10" fill="#555">× × × × ×</text><text x="240" y="145" text-anchor="middle" font-size="9" fill="#777">B into page</text><line x1="40" y1="100" x2="178" y2="100" stroke="#333" stroke-width="1.5" marker-end="url(#a)"/><text x="100" y="92" text-anchor="middle" font-size="11" fill="currentColor">path of electron</text><path d="M180 100 Q240 100 300 160" fill="none" stroke="#333" stroke-width="1.5" marker-end="url(#a)"/></svg>`,
  "ala-mock-2026-p4-Q8ai": `<svg width="100%" viewBox="0 0 400 100" role="img"><title>Hydrogen emission spectrum with three lines</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="40" y="35" width="300" height="35" rx="3" fill="#e8e8e8" stroke="#aaa" stroke-width="1"/><line x1="120" y1="35" x2="120" y2="70" stroke="#333" stroke-width="3"/><line x1="200" y1="35" x2="200" y2="70" stroke="#333" stroke-width="2.5"/><line x1="290" y1="35" x2="290" y2="70" stroke="#333" stroke-width="2"/><line x1="300" y1="20" x2="380" y2="20" stroke="#555" stroke-width="1" marker-end="url(#a)"/><text x="310" y="15" font-size="11" fill="currentColor">increasing frequency</text><text x="190" y="90" text-anchor="middle" font-size="11" fill="currentColor">Fig. 8.1 — emission spectrum (as seen from star)</text></svg>`,
  "ala-mock-2026-p4-Q8aii": `<svg width="100%" viewBox="0 0 400 120" role="img"><title>Redshifted hydrogen emission lines</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="40" y="30" width="300" height="35" rx="3" fill="#e8e8e8" stroke="#aaa" stroke-width="1"/><line x1="120" y1="30" x2="120" y2="65" stroke="#999" stroke-width="2" stroke-dasharray="4 2"/><line x1="200" y1="30" x2="200" y2="65" stroke="#999" stroke-width="2" stroke-dasharray="4 2"/><line x1="290" y1="30" x2="290" y2="65" stroke="#999" stroke-width="2" stroke-dasharray="4 2"/><line x1="95" y1="30" x2="95" y2="65" stroke="#c0392b" stroke-width="3"/><line x1="175" y1="30" x2="175" y2="65" stroke="#c0392b" stroke-width="2.5"/><line x1="265" y1="30" x2="265" y2="65" stroke="#c0392b" stroke-width="2"/><text x="190" y="22" text-anchor="middle" font-size="10" fill="#c0392b">← shifted left (redshift)</text><text x="190" y="90" text-anchor="middle" font-size="10" fill="#888">dashed = original positions, red = observed by Earth</text><line x1="300" y1="10" x2="380" y2="10" stroke="#555" stroke-width="1" marker-end="url(#a)"/><text x="305" y="8" font-size="10" fill="currentColor">increasing frequency</text></svg>`,
  "ala-mock-2026-p4-Q9biii": `<svg width="100%" viewBox="0 0 400 200" role="img"><title>Polonium decay and lead growth curves</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><line x1="50" y1="170" x2="380" y2="170" stroke="#888" stroke-width="1.2" marker-end="url(#a)"/><line x1="50" y1="170" x2="50" y2="20" stroke="#888" stroke-width="1.2" marker-end="url(#a)"/><text x="380" y="182" font-size="11" fill="currentColor">t / s</text><text x="30" y="18" font-size="11" fill="currentColor">N</text><path d="M50 30 C100 35 180 80 250 120 S340 155 360 160" fill="none" stroke="#2980b9" stroke-width="2"/><path d="M50 160 C100 155 180 120 250 80 S340 45 360 40" fill="none" stroke="#c0392b" stroke-width="2"/><text x="270" y="55" font-size="11" fill="#c0392b">Po-211 (decay)</text><text x="270" y="150" font-size="11" fill="#2980b9">Pb-207 (growth)</text><text x="130" y="183" text-anchor="middle" font-size="10" fill="#888">0.52 s (half-life)</text><line x1="130" y1="170" x2="130" y2="95" stroke="#888" stroke-width="1" stroke-dasharray="3 2"/><circle cx="130" cy="95" r="3" fill="#888"/></svg>`,
  "ala-mock-2026-p4-Q9bi": `<svg width="100%" viewBox="0 0 400 200" role="img"><title>Polonium-211 exponential decay curve</title><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><line x1="50" y1="170" x2="380" y2="170" stroke="#888" stroke-width="1.2" marker-end="url(#a)"/><line x1="50" y1="170" x2="50" y2="20" stroke="#888" stroke-width="1.2" marker-end="url(#a)"/><text x="370" y="182" font-size="11" fill="currentColor">t / s</text><text x="20" y="18" font-size="10" fill="currentColor">N/10¹²</text><text x="42" y="35" text-anchor="end" font-size="10" fill="currentColor">24</text><text x="42" y="101" text-anchor="end" font-size="10" fill="currentColor">12</text><text x="42" y="170" text-anchor="end" font-size="10" fill="currentColor">0</text><line x1="47" y1="33" x2="53" y2="33" stroke="#888" stroke-width="1"/><line x1="47" y1="100" x2="53" y2="100" stroke="#888" stroke-width="1"/><text x="50" y="183" text-anchor="middle" font-size="10" fill="currentColor">0</text><text x="180" y="183" text-anchor="middle" font-size="10" fill="currentColor">0.52</text><text x="340" y="183" text-anchor="middle" font-size="10" fill="currentColor">1.2</text><line x1="180" y1="170" x2="180" y2="100" stroke="#aaa" stroke-width="1" stroke-dasharray="3 2"/><path d="M50 33 C90 40 140 65 180 100 S280 145 340 158" fill="none" stroke="#c0392b" stroke-width="2.5"/><circle cx="180" cy="100" r="4" fill="#c0392b"/><text x="185" y="95" font-size="10" fill="#c0392b">(0.52, 12×10¹²)</text></svg>`,
};

// ─── SVG generator from diagram_description ─────────────────────────────────
function descriptionToSVG(desc) {
  if (!desc) return null;
  const d = desc.toLowerCase();

  // Cylinder with piston
  if (d.includes("piston") && (d.includes("cylinder") || d.includes("gas"))) {
    return `<svg width="100%" viewBox="0 0 500 170" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Cylinder with movable piston</title>
      <defs>
        <marker id="arrowL" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M9 1L1 5L9 9" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
      </defs>
      <!-- Cylinder body -->
      <rect x="80" y="40" width="290" height="90" rx="4" fill="none" stroke="#555" stroke-width="2"/>
      <!-- Closed right end cap -->
      <line x1="370" y1="40" x2="370" y2="130" stroke="#555" stroke-width="4"/>
      <!-- Piston -->
      <rect x="80" y="40" width="22" height="90" rx="2" fill="#bbb" stroke="#555" stroke-width="2"/>
      <!-- Gas molecules (random dots with velocity arrows) -->
      <circle cx="155" cy="72" r="4" fill="#2563eb"/>
      <circle cx="210" cy="95" r="4" fill="#2563eb"/>
      <circle cx="265" cy="65" r="4" fill="#2563eb"/>
      <circle cx="310" cy="100" r="4" fill="#2563eb"/>
      <circle cx="180" cy="115" r="4" fill="#2563eb"/>
      <circle cx="330" cy="68" r="4" fill="#2563eb"/>
      <circle cx="240" cy="52" r="4" fill="#2563eb"/>
      <!-- Small velocity arrows on molecules -->
      <line x1="155" y1="72" x2="168" y2="65" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrowL)"/>
      <line x1="210" y1="95" x2="222" y2="87" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrowL)"/>
      <line x1="265" y1="65" x2="255" y2="57" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrowL)"/>
      <line x1="310" y1="100" x2="298" y2="108" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrowL)"/>
      <line x1="330" y1="68" x2="342" y2="75" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrowL)"/>
      <!-- Piston movement arrow (leftward) -->
      <line x1="72" y1="85" x2="30" y2="85" stroke="#333" stroke-width="2" marker-start="url(#arrowL)"/>
      <text x="34" y="78" font-size="10" fill="#333">movement</text>
      <text x="34" y="90" font-size="10" fill="#333">of piston</text>
      <!-- Labels -->
      <text x="370" y="28" text-anchor="middle" font-size="11" fill="#555">cylinder</text>
      <line x1="340" y1="32" x2="340" y2="40" stroke="#888" stroke-width="1"/>
      <text x="91" y="148" text-anchor="middle" font-size="11" fill="#555">piston</text>
      <line x1="91" y1="142" x2="91" y2="131" stroke="#888" stroke-width="1"/>
      <text x="295" y="148" text-anchor="middle" font-size="11" fill="#2563eb">gas molecule</text>
      <line x1="265" y1="142" x2="265" y2="132" stroke="#2563eb" stroke-width="1"/>
    </svg>`;
  }

  // Trolley and springs (SHM)
  if ((d.includes("trolley") || d.includes("cart")) && d.includes("spring")) {
    return `<svg width="100%" viewBox="0 0 500 160" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Trolley between two springs on a surface</title>
      <!-- Ground line -->
      <line x1="10" y1="118" x2="490" y2="118" stroke="#888" stroke-width="1.5"/>
      <!-- Left wall -->
      <rect x="10" y="50" width="16" height="68" fill="#aaa" stroke="#888" stroke-width="1.5"/>
      <line x1="10" y1="50" x2="0" y2="60" stroke="#aaa" stroke-width="1.5"/>
      <line x1="10" y1="62" x2="0" y2="72" stroke="#aaa" stroke-width="1.5"/>
      <line x1="10" y1="74" x2="0" y2="84" stroke="#aaa" stroke-width="1.5"/>
      <line x1="10" y1="86" x2="0" y2="96" stroke="#aaa" stroke-width="1.5"/>
      <line x1="10" y1="98" x2="0" y2="108" stroke="#aaa" stroke-width="1.5"/>
      <!-- Point P label -->
      <circle cx="26" cy="90" r="3" fill="#333"/>
      <text x="28" y="86" font-size="11" fill="#333" font-weight="bold">P</text>
      <!-- Left spring (coil) -->
      <path d="M26,90 L50,90 Q54,80 58,90 Q62,100 66,90 Q70,80 74,90 Q78,100 82,90 Q86,80 90,90 Q94,100 98,90 L102,90" fill="none" stroke="#555" stroke-width="1.8"/>
      <!-- Trolley body -->
      <rect x="102" y="78" width="120" height="38" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <text x="162" y="102" text-anchor="middle" font-size="12" fill="#333">trolley</text>
      <!-- Trolley wheels -->
      <circle cx="120" cy="118" r="8" fill="none" stroke="#555" stroke-width="1.5"/>
      <circle cx="164" cy="118" r="8" fill="none" stroke="#555" stroke-width="1.5"/>
      <circle cx="208" cy="118" r="8" fill="none" stroke="#555" stroke-width="1.5"/>
      <!-- Right spring (coil) -->
      <path d="M222,90 L246,90 Q250,80 254,90 Q258,100 262,90 Q266,80 270,90 Q274,100 278,90 Q282,80 286,90 Q290,100 294,90 L318,90" fill="none" stroke="#555" stroke-width="1.8"/>
      <!-- Right wall / oscillator box -->
      <rect x="318" y="68" width="60" height="50" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <text x="348" y="98" text-anchor="middle" font-size="10" fill="#333">oscillator</text>
      <!-- Right wall hash -->
      <rect x="378" y="68" width="14" height="50" fill="#aaa" stroke="#888" stroke-width="1.5"/>
      <line x1="392" y1="68" x2="402" y2="58" stroke="#aaa" stroke-width="1.5"/>
      <line x1="392" y1="80" x2="402" y2="70" stroke="#aaa" stroke-width="1.5"/>
      <line x1="392" y1="92" x2="402" y2="82" stroke="#aaa" stroke-width="1.5"/>
      <line x1="392" y1="104" x2="402" y2="94" stroke="#aaa" stroke-width="1.5"/>
    </svg>`;
  }

  // Graph sketch axes (V-t, Q-t, I-t, p-V, etc.)
  if (d.includes("graph") || d.includes("sketch") || d.includes("axes") || d.includes("axis") || d.includes("plot")) {
    // Try to extract axis labels from description
    const axisMatch = desc.match(/([A-Za-zμ /^0-9]+)\s*(?:against|vs\.?|versus|on)\s*([A-Za-zμ /^0-9]+)/i);
    const yLabel = axisMatch ? axisMatch[1].trim() : "y";
    const xLabel = axisMatch ? axisMatch[2].trim() : "x";
    return `<svg width="100%" viewBox="0 0 300 200" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Graph axes: ${yLabel} vs ${xLabel}</title>
      <defs>
        <marker id="arrowG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
        </marker>
      </defs>
      <!-- Grid lines -->
      <line x1="50" y1="30" x2="50" y2="150" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="110" y1="30" x2="110" y2="150" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="170" y1="30" x2="170" y2="150" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="230" y1="30" x2="230" y2="150" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="50" y1="60" x2="270" y2="60" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="50" y1="90" x2="270" y2="90" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="50" y1="120" x2="270" y2="120" stroke="#ddd" stroke-width="0.8" stroke-dasharray="4 3"/>
      <!-- Axes -->
      <line x1="50" y1="150" x2="270" y2="150" stroke="#555" stroke-width="1.8" marker-end="url(#arrowG)"/>
      <line x1="50" y1="150" x2="50" y2="25" stroke="#555" stroke-width="1.8" marker-end="url(#arrowG)"/>
      <!-- Axis labels -->
      <text x="265" y="165" font-size="12" fill="#333" text-anchor="middle">${xLabel}</text>
      <text x="18" y="90" font-size="12" fill="#333" text-anchor="middle" transform="rotate(-90 18 90)">${yLabel}</text>
      <!-- Origin label -->
      <text x="44" y="163" font-size="10" fill="#888" text-anchor="middle">0</text>
      <!-- Caption -->
      <text x="160" y="192" text-anchor="middle" font-size="10" fill="#888">${desc.slice(0, 60)}${desc.length > 60 ? "…" : ""}</text>
    </svg>`;
  }

  return null;
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function MockQuestionDisplay({ question }) {
  if (!question) return null;
  const { question_id, question_number, question_text, diagram_description, graph_data, image_url } = question;

  const svgDiagram = (question_id ? DIAGRAM_SVGS[question_id] : null) ?? descriptionToSVG(diagram_description);

  return (
    <div className="space-y-4">
      {/* Question number badge */}
      {question_number && (
        <span className="inline-block font-mono text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
          {question_number}
        </span>
      )}

      {/* SVG diagram — hardcoded first, then generated from description */}
      {svgDiagram ? (
        <div
          dangerouslySetInnerHTML={{ __html: svgDiagram }}
          style={{
            margin: "12px 0",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: 10,
            background: "rgba(255,255,255,0.97)",
          }}
        />
      ) : diagram_description ? (
        /* Last-resort: plain text description box */
        <div className="bg-blue-950/40 border border-blue-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">📊</span>
          <p className="text-sm text-blue-200/85 leading-relaxed italic">
            <span className="not-italic font-semibold text-blue-300">Diagram: </span>
            {diagram_description}
          </p>
        </div>
      ) : null}

      {/* Image */}
      {image_url && (
        <img
          src={image_url}
          alt={diagram_description || "Question diagram"}
          className="w-full rounded-lg border border-border/60 object-contain max-h-72"
          style={{ background: "#fff" }}
        />
      )}

      {/* Graph */}
      {graph_data && (
        <div className="bg-secondary/50 border border-border rounded-xl p-3">
          <MockGraphRenderer graphData={graph_data} />
        </div>
      )}

      {/* Question text — markdown-aware renderer */}
      {question_text && (
        <MarkdownText text={question_text} className="text-[15px] leading-relaxed text-foreground/90" />
      )}
    </div>
  );
}