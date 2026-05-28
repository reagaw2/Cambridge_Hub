/**
 * ingestorQuestions.js
 * Each entry has: question, markscheme, question_type, diagram_svg (optional)
 * question_type: "written" | "register_fill" | "pixel_grid" | "table_fill" | "matching"
 */

// ── SVG Helpers ─────────────────────────────────────────────────────────────

function registerSVG(bits) {
  const cells = bits.split("").map((b, i) => `
    <rect x="${10 + i * 36}" y="10" width="34" height="34" fill="white" stroke="#333" stroke-width="1.5"/>
    <text x="${27 + i * 36}" y="32" text-anchor="middle" font-size="16" font-family="monospace" fill="#111">${b !== "_" ? b : ""}</text>
  `).join("");
  return `<svg width="310" height="54" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
}

function labelledRegisterSVG(label, bits) {
  const cells = bits.split("").map((b, i) => `
    <rect x="${40 + i * 34}" y="8" width="32" height="32" fill="white" stroke="#333" stroke-width="1.5"/>
    <text x="${56 + i * 34}" y="29" text-anchor="middle" font-size="14" font-family="monospace" fill="#111">${b !== "_" ? b : ""}</text>
  `).join("");
  return `<svg width="325" height="50" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="28" font-size="13" font-family="sans-serif" fill="#333">${label}</text>
    ${cells}
  </svg>`;
}

function emptyRegisterSVG(label = "") {
  const cells = Array(8).fill(0).map((_, i) => `
    <rect x="${(label ? 40 : 6) + i * 34}" y="8" width="32" height="32" fill="white" stroke="#333" stroke-width="1.5"/>
  `).join("");
  return `<svg width="${label ? 325 : 290}" height="50" xmlns="http://www.w3.org/2000/svg">
    ${label ? `<text x="4" y="28" font-size="13" font-family="sans-serif" fill="#333">${label}</text>` : ""}
    ${cells}
  </svg>`;
}

function pixelGridSVG(rows, cellSize = 36, colors = {}) {
  const defaultColors = { B: "#222", W: "#fff", R: "#e33", G: "#2a2", P: "#90e", O: "#f80", K: "#111" };
  const col = (c) => colors[c] ?? defaultColors[c] ?? "#ccc";
  const height = rows.length * cellSize;
  const width = rows[0].length * cellSize;
  const cells = rows.flatMap((row, ri) =>
    row.map((c, ci) => `
      <rect x="${ci * cellSize}" y="${ri * cellSize}" width="${cellSize}" height="${cellSize}" fill="${col(c)}" stroke="#aaa" stroke-width="1"/>
      <text x="${ci * cellSize + cellSize / 2}" y="${ri * cellSize + cellSize / 2 + 5}" text-anchor="middle" font-size="13" font-family="monospace" fill="${col(c) === "#fff" ? "#333" : (col(c) === "#222" || col(c) === "#111") ? "#fff" : "#fff"}">${c}</text>
    `)
  ).join("");
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
}

function bitmapPatternSVG(rows) {
  // rows: array of arrays, 1 = black, 0 = white
  const cs = 32;
  const w = rows[0].length * cs;
  const h = rows.length * cs;
  const cells = rows.flatMap((row, ri) =>
    row.map((v, ci) => `<rect x="${ci * cs}" y="${ri * cs}" width="${cs}" height="${cs}" fill="${v ? "#111" : "#fff"}" stroke="#bbb" stroke-width="0.8"/>`)
  ).join("");
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
}

// ── Q1 — No diagram ──────────────────────────────────────────────────────────
// ── Q2 — No diagram ──────────────────────────────────────────────────────────
// ── Q3 — No diagram ──────────────────────────────────────────────────────────
// ── Q4 — No diagram ──────────────────────────────────────────────────────────

// ── Q5 — PJF Interiors logo ──────────────────────────────────────────────────
const Q5_LOGO = `<svg width="160" height="110" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="100" height="80" fill="white" stroke="#555" stroke-width="2"/>
  <polygon points="110,10 150,30 150,90 110,90" fill="#e0e0e0" stroke="#555" stroke-width="2"/>
  <polygon points="10,10 110,10 150,30 50,30" fill="#d0d0d0" stroke="#555" stroke-width="2"/>
  <text x="22" y="55" font-size="12" font-family="serif" font-weight="bold" fill="#222">✦ PJF</text>
  <text x="22" y="72" font-size="12" font-family="serif" fill="#222">Interiors</text>
</svg>`;

// ── Q9 — Matching: colours to bits ───────────────────────────────────────────
const Q9_MATCHING = `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="20" font-size="11" font-weight="bold" fill="#555">Max colours</text>
  <text x="200" y="20" font-size="11" font-weight="bold" fill="#555">Min bits</text>
  ${[["68",40],["256",90],["127",140],["2",190],["249",240]].map(([v,y]) =>
    `<rect x="10" y="${y}" width="80" height="30" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
     <text x="50" y="${y+20}" text-anchor="middle" font-size="13" fill="#222">${v}</text>`
  ).join("")}
  ${[["1",40],["2",75],["3",110],["7",145],["8",180],["9",215]].map(([v,y]) =>
    `<rect x="200" y="${y}" width="60" height="30" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
     <text x="230" y="${y+20}" text-anchor="middle" font-size="13" fill="#222">${v}</text>`
  ).join("")}
</svg>`;

// ── Q13 — No diagram (all text) ──────────────────────────────────────────────

// ── Q15 — Register H = 11000001 ──────────────────────────────────────────────
const Q15_REG = labelledRegisterSVG("H", "11000001");

// ── Q16 — Black and white bitmap pattern ─────────────────────────────────────
const Q16_BITMAP = bitmapPatternSVG([
  [0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0],
  [0,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,0,0],
  [0,1,1,1,1,1,0,0],
  [0,1,1,0,0,1,0,0],
  [0,0,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0],
]);

// ── Q16(b) — TT bitmap ──────────────────────────────────────────────────────
const Q16B_BITMAP = bitmapPatternSVG([
  [1,1,1,1,1,1],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
]);

// ── Q17 — Lossy/Lossless tick table ──────────────────────────────────────────
const Q17_TABLE = `<svg width="300" height="130" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="280" height="110" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
  <line x1="10" y1="36" x2="290" y2="36" stroke="#555" stroke-width="1"/>
  <line x1="160" y1="10" x2="160" y2="120" stroke="#555" stroke-width="1"/>
  <line x1="225" y1="10" x2="225" y2="120" stroke="#555" stroke-width="1"/>
  <text x="75" y="28" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">Compression method</text>
  <text x="192" y="28" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">Lossy</text>
  <text x="257" y="28" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">Lossless</text>
  ${[["Cropping the image",55],["Reducing the resolution",78],["Using RLE",101],["Reducing colour depth",124]].map(([t,y],i) => {
    if (y > 120) return "";
    return `<text x="15" y="${y - (i===0?3:0)}" font-size="10" fill="#333">${t}</text>`;
  }).join("")}
  ${[55,78,101].map(y =>
    `<line x1="10" y1="${y}" x2="290" y2="${y}" stroke="#eee" stroke-width="0.8"/>`
  ).join("")}
</svg>`;

// ── Q18 — Register X = 10111010 ──────────────────────────────────────────────
const Q18_REG = labelledRegisterSVG("X", "10111010");

// ── Q19 — 6×6 pixel grid GRKWR pattern ──────────────────────────────────────
const Q19_GRID = pixelGridSVG([
  ["G","R","G","K","W","R"],
  ["G","R","G","K","W","R"],
  ["G","R","G","K","W","R"],
  ["G","R","G","K","W","R"],
  ["G","G","G","K","K","R"],
  ["W","W","W","W","K","R"],
], 38, { G:"#777", R:"#c33", K:"#111", W:"#fff" });

// ── Q20 — Register X = 11000001 ──────────────────────────────────────────────
const Q20_REG = labelledRegisterSVG("X", "11000001");

// ── Q21 — 6×6 colour pixel grid ──────────────────────────────────────────────
const Q21_GRID = pixelGridSVG([
  ["R","R","P","P","P","G"],
  ["B","R","R","P","G","G"],
  ["B","W","B","B","O","O"],
  ["B","W","W","P","P","O"],
  ["B","B","R","P","G","O"],
  ["B","R","R","P","G","O"],
], 38, { R:"#c33", P:"#c0f", G:"#2a2", B:"#44c", W:"#fff", O:"#f80" });

// ── Q22 — Register X = 11110010 ──────────────────────────────────────────────
const Q22_REG = labelledRegisterSVG("X", "11110010");

// ── Q26 — BCD register diagram ───────────────────────────────────────────────
const Q26_BCD = `<svg width="440" height="50" xmlns="http://www.w3.org/2000/svg">
  ${["0","1","0","0","1","1","1","0","0","0","1","0"].map((b,i) =>
    `<rect x="${6 + i * 35}" y="8" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>
     <text x="${22 + i * 35}" y="29" text-anchor="middle" font-size="14" font-family="monospace" fill="#111">${b}</text>`
  ).join("")}
</svg>`;

// ── Q27 — Register for 55 and -102 ───────────────────────────────────────────
const Q27_REGS = `<svg width="320" height="120" xmlns="http://www.w3.org/2000/svg">
  <text x="2" y="28" font-size="12" fill="#333">55</text>
  ${Array(8).fill(0).map((_,i) =>
    `<rect x="${28 + i * 35}" y="8" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>`
  ).join("")}
  <text x="2" y="90" font-size="12" fill="#333">−102</text>
  ${Array(8).fill(0).map((_,i) =>
    `<rect x="${28 + i * 35}" y="68" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>`
  ).join("")}
</svg>`;

// ── Q33 — Matching: hex/BCD/binary to denary ─────────────────────────────────
const Q33_MATCHING = `<svg width="360" height="280" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="18" font-size="11" font-weight="bold" fill="#555">Hex / BCD / Binary</text>
  <text x="240" y="18" font-size="11" font-weight="bold" fill="#555">Denary</text>
  ${[["Hex: 3A",40],["BCD: 0100 1001",100],["Binary: 01011101",160],["Two's comp: 11000001",220]].map(([v,y]) =>
    `<rect x="10" y="${y}" width="150" height="45" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
     <text x="85" y="${y+28}" text-anchor="middle" font-size="11" fill="#222">${v}</text>`
  ).join("")}
  ${[["93",30],["−65",75],["58",120],["−63",165],["73",210],["49",255],["−93",300]].filter((_,i)=>i<6).map(([v,y]) =>
    `<rect x="240" y="${y}" width="60" height="30" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
     <text x="270" y="${y+20}" text-anchor="middle" font-size="12" fill="#222">${v}</text>`
  ).join("")}
</svg>`;

// ── Q34 — Registers for 114 and -93 ──────────────────────────────────────────
const Q34_REGS = `<svg width="320" height="120" xmlns="http://www.w3.org/2000/svg">
  <text x="2" y="28" font-size="12" fill="#333">114</text>
  ${Array(8).fill(0).map((_,i) =>
    `<rect x="${28 + i * 35}" y="8" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>`
  ).join("")}
  <text x="2" y="90" font-size="12" fill="#333">−93</text>
  ${Array(8).fill(0).map((_,i) =>
    `<rect x="${28 + i * 35}" y="68" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>`
  ).join("")}
</svg>`;

// ── Q36 — Registers for 124 and -77 ──────────────────────────────────────────
const Q36_REGS = `<svg width="320" height="120" xmlns="http://www.w3.org/2000/svg">
  <text x="2" y="28" font-size="12" fill="#333">124</text>
  ${Array(8).fill(0).map((_,i) =>
    `<rect x="${28 + i * 35}" y="8" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>`
  ).join("")}
  <text x="2" y="90" font-size="12" fill="#333">−77</text>
  ${Array(8).fill(0).map((_,i) =>
    `<rect x="${28 + i * 35}" y="68" width="33" height="32" fill="white" stroke="#333" stroke-width="1.5"/>`
  ).join("")}
</svg>`;

// ── Q37 — Matching: computer graphics terms ───────────────────────────────────
const Q37_MATCHING = `<svg width="380" height="340" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="18" font-size="11" font-weight="bold" fill="#555">Term</text>
  <text x="210" y="18" font-size="11" font-weight="bold" fill="#555">Description</text>
  ${[["Bitmap graphic",30],["Image file header",80],["Image resolution",130],["Pixel",180],["Screen resolution",230],["Vector graphic",280]].map(([v,y]) =>
    `<rect x="10" y="${y}" width="130" height="38" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
     <text x="75" y="${y+24}" text-anchor="middle" font-size="11" fill="#222">${v}</text>`
  ).join("")}
  ${[
    ["Measured in dpi",25],["Picture element",70],["Rows/columns of pixels",115],
    ["Drawing objects",160],["Specifies image size/colours",205],["Samples per second",250],["Monitor spec e.g. 1024×768",295]
  ].map(([v,y]) =>
    `<rect x="210" y="${y}" width="160" height="38" fill="white" stroke="#555" stroke-width="1.5" rx="4"/>
     <text x="290" y="${y+24}" text-anchor="middle" font-size="10" fill="#222">${v}</text>`
  ).join("")}
</svg>`;

// ── Q38 — Touch screen S T U diagram ─────────────────────────────────────────
const Q38_SCREEN = `<svg width="280" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="260" height="100" fill="white" stroke="#555" stroke-width="2" rx="4"/>
  ${[["S",50],["T",130],["U",210]].map(([l,x]) =>
    `<rect x="${x - 20}" y="25" width="40" height="40" fill="white" stroke="#555" stroke-width="1.5"/>
     <text x="${x}" y="52" text-anchor="middle" font-size="16" font-family="serif" fill="#222">${l}</text>`
  ).join("")}
</svg>`;

// ── Q38(a) — Memory table ────────────────────────────────────────────────────
const Q38_MEMORY = `<svg width="280" height="110" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="8" width="220" height="100" fill="white" stroke="#555" stroke-width="1.5" rx="2"/>
  <line x1="40" y1="32" x2="260" y2="32" stroke="#555" stroke-width="1"/>
  <line x1="40" y1="56" x2="260" y2="56" stroke="#555" stroke-width="0.8"/>
  <line x1="40" y1="78" x2="260" y2="78" stroke="#555" stroke-width="0.8"/>
  <line x1="120" y1="8" x2="120" y2="108" stroke="#555" stroke-width="1"/>
  <text x="80" y="25" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">Address</text>
  <text x="190" y="25" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">Memory contents</text>
  <text x="4" y="50" font-size="11" fill="#333">S</text>
  <text x="80" y="50" text-anchor="middle" font-size="12" font-family="monospace" fill="#333">40</text>
  <text x="190" y="50" text-anchor="middle" font-size="12" font-family="monospace" fill="#333">0000 1011 0100</text>
  <text x="4" y="72" font-size="11" fill="#333">T</text>
  <text x="80" y="72" text-anchor="middle" font-size="12" font-family="monospace" fill="#333">41</text>
  <text x="190" y="72" text-anchor="middle" font-size="12" font-family="monospace" fill="#333">0010 0101 0100</text>
  <text x="4" y="96" font-size="11" fill="#333">U</text>
  <text x="80" y="96" text-anchor="middle" font-size="12" font-family="monospace" fill="#333">42</text>
  <text x="190" y="96" text-anchor="middle" font-size="12" font-family="monospace" fill="#333">0100 0110 1100</text>
</svg>`;

// ── Full question bank ────────────────────────────────────────────────────────

export const PRELOADED_PAIRS = [
  {
    id: 1,
    question_type: "written",
    question: `A digital camera takes a bitmap image. The image is 2000 pixels wide by 1000 pixels high with a colour depth of 24 bits.
(a) Calculate an estimate of the file size for the image. Give your answer in megabytes. Show your working.
(b) A second image is taken in black and white. It has the same number of pixels, but the file size is smaller. Explain why.
(c)(i) Give the 8-bit binary value for the ASCII character 'b'.

The ASCII denary values table is shown below:
| Character | ASCII denary value |
| a | 97 |
| b | 98 |
| c | 99 |
| d | 100 |
| e | 101 |

(c)(ii) Complete the ASCII table for character 't': give the ASCII denary value and hexadecimal value.`,
    markscheme: `(a) [3] 2000×1000×24=48000000 bits; /8=6000000 bytes; /1024/1024≈5.7MB or 6MB
(b) [2] Only 1 bit needed per pixel for black and white; fewer bits means smaller file size
(c)(i) [1] 0110 0010
(c)(ii) [2] ASCII denary value: 116; hexadecimal: 74`,
  },
  {
    id: 2,
    question_type: "written",
    question: `Samira uses a computer to draw a logo and saves it as a vector graphic.
(i) Describe how the logo is represented by the computer when saved as a vector graphic.
(ii) State two reasons why the hotel logo is saved as a vector graphic instead of a bitmapped graphic.`,
    markscheme: `(i) [3] Series of geometric shapes/objects; stored as coordinates; drawing list/commands/formulae; with attributes such as colour, line thickness stored
(ii) [2] Can be enlarged/resized without pixelation/loss of quality; vector files have smaller file size than bitmap`,
  },
  {
    id: 3,
    question_type: "written",
    question: `Amir has created a sound file.
(a) Complete the table by writing the missing definitions and terms about sound:

| Term | Definition |
| Sampling | ........................... |
| ........................... | The number of samples per unit time |
| Sampling resolution | ........................... |

(b)(i) Name one lossless compression technique that can be used to reduce the file size.
(b)(ii) Describe one lossy compression technique to reduce the file size.`,
    markscheme: `(a) [3] Sampling: measuring the amplitude of a sound wave at regular intervals and encoding as a binary number. Sampling rate: the number of samples per unit time. Sampling resolution: the number of bits used to represent each sample.
(b)(i) [1] Run-length encoding, or Huffman Coding
(b)(ii) [2] Reduce the sampling rate so fewer samples are taken per second and the file contains less data; OR reduce the sampling resolution so fewer bits are used per sample`,
  },
  {
    id: 4,
    question_type: "written",
    question: `Wei wants to compress source code to transport it to another computer.
Identify the most appropriate compression technique. Justify your choice.`,
    markscheme: `[3] Lossless compression (1 mark); because lossless does not lose any data (1 mark); any lost data will make the program not run correctly (1 mark)`,
  },
  {
    id: 5,
    question_type: "written",
    diagram_svg: Q5_LOGO,
    question: `Xiaoming created the following logo using bitmapped graphics software.

[The logo shows a 3D box shape with "✦ PJF Interiors" text]

(a) Describe how one typical feature of bitmapped software was used to create the logo.
(b) The logo is 160×160 pixels with a colour depth of 3 bytes per pixel. Calculate the file size in kilobytes.
(c) State one benefit of a vector graphic over a bitmap for this logo.
(d) The hexadecimal colour value of the background is 913C8E. Complete the table by converting each hexadecimal value to denary:

| | Red | Green | Blue |
| Hexadecimal value | 91 | 3C | 8E |
| Denary value | | | |`,
    markscheme: `(a) [2] Any valid feature plus how it was used e.g. colour fill tool used to fill the background; crop tool used to remove unwanted parts; text tool used to add the company name
(b) [3] 160×160=25600 pixels; ×3=76800 bytes; 76800/1024=75KB
(c) [2] Can be resized without pixelation; smaller file size
(d) [2] Red=145, Green=60, Blue=142`,
  },
  {
    id: 6,
    question_type: "written",
    question: `A recording of a concert is streamed over the internet after lossy compression.
(i) State why compression is needed for streaming.
(ii) Explain why lossy compression is more appropriate than lossless compression for this sound file.`,
    markscheme: `(i) [1] Sound/video data files are very large; streaming requires faster download; less bandwidth is needed
(ii) [3] Lossy creates a smaller file than lossless; the large file needs a significant reduction in size; loss of detail is not noticed by the listener / human ear cannot detect the lost data`,
  },
  {
    id: 7,
    question_type: "written",
    question: `A student records a video.
(a) Describe interlaced encoding.
(b) State one benefit of interlaced encoding compared to progressive encoding.
(c) Explain how temporal redundancy allows video to be compressed.
(d)(i) Describe how a computer encodes a sound track as a digital file.
(d)(ii) Explain how increasing the sampling rate and increasing the sampling resolution each affect the file size.`,
    markscheme: `(a) [3] Each frame is split into two fields of alternating (odd/even) rows; the two fields are displayed alternately; the viewer sees data from two frames simultaneously
(b) [1] Higher perceived refresh rate; lower bandwidth needed
(c) [2] Identifies pixels that do not change between consecutive frames; only stores the differences/changes rather than the whole frame
(d)(i) [3] Amplitude of sound wave is measured at regular intervals (sampled); each measurement is encoded as a binary number
(d)(ii) [2] Higher sampling rate → more samples per second → larger file. Higher sampling resolution → more bits per sample → larger file`,
  },
  {
    id: 8,
    question_type: "written",
    question: `Describe progressive encoding of video.`,
    markscheme: `[2] All scan lines for a complete frame are stored/transmitted at the same time; complete frames are displayed in sequence; the rate of picture display equals the frame rate`,
  },
  {
    id: 9,
    question_type: "matching",
    diagram_svg: Q9_MATCHING,
    question: `Xander creates a presentation that includes images, video and sound.
(a) The images are bitmap images. Draw one line from each box on the left to the correct box on the right to identify the minimum number of bits needed to store each maximum number of colours.

Maximum number of colours: 68, 256, 127, 2, 249
Minimum number of bits: 1, 2, 3, 7, 8, 9

Match each maximum number of colours to the correct minimum number of bits.`,
    markscheme: `[3] 68→7 bits; 256→8 bits; 127→7 bits; 2→1 bit; 249→8 bits. Award 1 mark per correct pair up to 3.`,
  },
  {
    id: 10,
    question_type: "written",
    question: `(a)(i) State the number of colours that can be represented using an 8-bit colour depth.
(a)(ii) Convert the binary number 0100 1110 to denary.
(b) Convert the denary number -194 to 12-bit two's complement binary.
(c)(i) Convert the BCD number 0110 1001 to denary.
(c)(ii) State one practical use of BCD.
(d) Describe how one character is represented in a character set.
(e) Identify whether lossy or lossless compression should be used for:
(i) A high-level language program
(ii) A photo to be sent by email
(iii) A video to be uploaded to a website`,
    markscheme: `(a)(i) [1] 256
(a)(ii) [1] 78
(b) [1] 1111 0011 1110
(c)(i) [1] 69
(c)(ii) [1] Calculator display / digital clock
(d) [2] Each character is assigned a unique denary/binary/hex number
(e)(i) [2] Lossless – any lost data would make the program not work correctly
(e)(ii) [2] Lossy – reduction in colour depth/resolution not noticeable; email requires smaller file
(e)(iii) [2] Lossy – quality loss not noticeable; faster upload needed`,
  },
  {
    id: 11,
    question_type: "written",
    question: `Dominic's tablet captures video.
(i) Describe how images and sound are encoded as digital files.
(ii) Describe interlaced encoding and progressive encoding. State one difference between them.
(iii) Define temporal redundancy and spatial redundancy in video.`,
    markscheme: `(i) [4] Images: made up of pixels, each pixel has a unique colour code stored as binary. Sound: amplitude measured at regular intervals; each value stored as binary number
(ii) [4] Interlaced: frame divided into two fields of odd/even rows; fields displayed alternately; viewer sees two frames simultaneously. Progressive: complete frame stored and displayed at once; rate of display = frame rate
(iii) [2] Temporal: same pixel values appear in the same location in consecutive frames. Spatial: sequence of pixels in a single frame have the same value`,
  },
  {
    id: 12,
    question_type: "written",
    question: `Leonardo records his voice.
(i) Describe how sound sampling encodes sound as a digital file.
(ii) Explain the effect on the recording and file size of changing the sampling rate from 44100 Hz to 21000 Hz.
(iii) Name two features of sound editing software and describe the purpose of each.`,
    markscheme: `(i) [2] Amplitude of the sound wave is measured at regular time intervals; each value is stored as a binary number
(ii) [2] Lower sampling rate → smaller file size; but less accurate sound / lower quality recording
(iii) [4] e.g. Amplify/volume control: increases or decreases volume. Change pitch: raises or lowers the pitch. Cut/delete: removes a section of sound. Copy/paste: duplicates a section`,
  },
  {
    id: 13,
    question_type: "written",
    question: `A logo is stored as a bitmap image.
(a) Describe what a bitmap image is.
(b) The logo contains only black and white pixels. Explain how Run Length Encoding (RLE) would compress this image.
(c) The logo is 500 pixels wide by 1000 pixels high and uses 35 different colours. Estimate the file size in kilobytes. Show your working.
(d) State two benefits of storing the logo as a vector graphic instead of a bitmap.`,
    markscheme: `(a) [2] Made up of pixels arranged in rows and columns; each pixel stores one colour as a binary value
(b) [2] RLE stores a colour value and the number of times it repeats consecutively; e.g. Black 5, White 3 instead of storing each pixel separately
(c) [4] 35 colours needs 6 bits (2^5=32 not enough, 2^6=64 ✓); 500×1000=500000 pixels; ×6/8=375000 bytes; ÷1024≈366KB
(d) [4] Can be resized/scaled without pixelation; smaller file size than equivalent bitmap`,
  },
  {
    id: 14,
    question_type: "written",
    question: `A student recorded a sound track.
(a) Explain how an analogue sound wave is sampled to produce a digital sound file.
(b) The current sampling rate is 44.1 kHz. Explain the effect of changing the sampling rate to 22.05 kHz on the quality and file size.
(c) Describe two features of sound editing software and the purpose of each feature.`,
    markscheme: `(a) [3] The amplitude of the sound wave is measured at regular time intervals; each measurement is assigned a binary value; the sequence of values forms the digital file
(b) [3] Sampling rate halved → half as many samples per second; file size reduces (halved); larger gaps between samples → lower quality / less accurate reproduction of original sound
(c) [4] e.g. Fading (gradually change volume), Remove/cut (delete sections), Copy (repeat/duplicate elements), Normalise (adjust volume to maximum)`,
  },
  {
    id: 15,
    question_type: "written",
    diagram_svg: Q15_REG,
    question: `Register H contains the following 8-bit value:

[Register H: 1 1 0 0 0 0 0 1]

(i) Convert the value in register H into denary (treating as an unsigned binary integer).
(ii) Convert the value in register H into hexadecimal.
(iii) Convert the value in register H as a two's complement binary integer into denary.
(iv) Explain why the value in register H does not contain a valid BCD value.`,
    markscheme: `(i) [1] 193
(ii) [1] C1
(iii) [1] -63
(iv) [1] The first nibble 1100 represents 12 in denary which is greater than 9, so it is not a valid BCD digit`,
  },
  {
    id: 16,
    question_type: "written",
    diagram_svg: Q16_BITMAP,
    question: `A black and white bitmap image is shown above.

(a) State the minimum number of bits needed to represent each pixel in this image.
(b) Apply RLE encoding to the first row of the bitmap. Use: 1=black, 3=white.
(c) State the minimum number of bits per pixel needed to represent an image with 30 different colours.
(d) State the purpose of a file header and give two examples of data stored in it.
(e) Describe three features of graphics software and explain the effect of using each feature.`,
    markscheme: `(a) [1] 1 bit (only black and white)
(b) [3] Correct RLE encoding e.g. White 4, Black 1, White 3 (depends on first row pattern)
(c) [1] 5 bits (2^4=16 not enough, 2^5=32 ✓)
(d) [3] Purpose: stores metadata about the image file. Examples: file type/format, file size, image dimensions (width×height), colour depth
(e) [6] e.g. Resize: changes the dimensions of the image. Crop: removes parts of the image outside a selection. Blur/soften: reduces sharpness. Red-eye reduction: removes red-eye effect in photos.`,
  },
  {
    id: 16.5,
    question_type: "written",
    diagram_svg: Q16B_BITMAP,
    question: `A black and white bitmap image is shown above (a π shape pattern).

(b) Run-length encoding is used to store the image with the following colour codes:
Black = 1A, White = 3B

Show how run-length encoding is used to store this image. Write the RLE encoding for each row.`,
    markscheme: `[3] Row 1: 1A6 (all black) or equivalent. Row 2 onwards: correct pairs of (colour code)(count) for each run. Award 1 mark per correct row up to 3.`,
  },
  {
    id: 17,
    question_type: "written",
    diagram_svg: Q17_TABLE,
    question: `A student creates a video with background music.
(a) Explain how a microphone captures music as an electrical signal.
(b) Explain how sampling resolution affects the quality and file size of the sound file.
(c) Describe two features of sound editing software.
(d) What does 60 fps mean? Describe progressive video encoding.
(e) Tick (✓) one box on each row to indicate whether each method is lossy or lossless:
- Cropping the image
- Reducing the resolution of the image  
- Using run-length encoding (RLE)
- Reducing the colour depth of the image
(f) What is a multimedia container format?`,
    markscheme: `(a) [3] Sound waves cause the diaphragm to vibrate; the coil moves past a magnet; an electric current (EMF) is generated
(b) [3] Sampling resolution = number of bits per sample; higher resolution → larger file size; higher resolution → smaller quantisation error / more accurate sound
(c) [2] e.g. Cut/delete, Copy/paste, Amplify, Change pitch
(d) [3] 60 fps = 60 frames/images displayed or recorded per second. Progressive: complete image captured/stored for each frame; all rows captured at the same time
(e) [4] Cropping=Lossy, Reducing resolution=Lossy, RLE=Lossless, Reducing colour depth=Lossy
(f) [1] A meta-file/wrapper that contains various data types such as video, audio, subtitles in one file`,
  },
  {
    id: 18,
    question_type: "written",
    diagram_svg: Q18_REG,
    question: `Register X contains the following 8-bit value:

[Register X: 1 0 1 1 1 0 1 0]

(i) Convert the value in register X into denary (treating as an unsigned binary integer).
(ii) Convert the value in register X into hexadecimal.
(iii) Convert the value in register X as a two's complement binary integer into denary.`,
    markscheme: `(i) [1] 186
(ii) [1] BA
(iii) [1] -70`,
  },
  {
    id: 19,
    question_type: "written",
    diagram_svg: Q19_GRID,
    question: `A company is designing a website.
(a) The company creates a 4-colour bitmap image for the website as shown above. Each colour is represented by a letter: G=grey, R=red, K=black, W=white.

(i) State the minimum number of bits needed to represent each pixel in the image.
(ii) Calculate the minimum file size in bytes for this 6×6 pixel image.

(b)(ii) The photograph needs to be sent by email but the file size is too big. Tick (✓) one box on each row to indicate whether each method is lossy or lossless:
- Cropping the image
- Reducing the resolution of the image
- Using run-length encoding (RLE)
- Reducing the colour depth of the image

(c) Explain how run-length encoding would compress the image.`,
    markscheme: `(a)(i) [1] 2 bits (4 colours = 2^2)
(a)(ii) [2] 36 pixels × 2 bits = 72 bits = 9 bytes
(b)(ii) [4] Cropping=Lossy; Reducing resolution=Lossy; RLE=Lossless; Reducing colour depth=Lossy
(c) [2] Stores the colour value and the number of consecutive pixels with that value; e.g. G1 R1 G1 K1 W1 R1 for first row`,
  },
  {
    id: 20,
    question_type: "written",
    diagram_svg: labelledRegisterSVG("X", "11000001"),
    question: `Register X contains the following 8-bit value:

[Register X: 1 1 0 0 0 0 0 1]

(i) The contents of X represent an unsigned binary integer. Convert the value into denary.
(ii) The contents of X represent an unsigned binary integer. Convert the value into hexadecimal.
(iii) The contents of X represent a two's complement binary integer. Convert the value into denary.`,
    markscheme: `(i) [1] 193
(ii) [1] C1
(iii) [1] -63`,
  },
  {
    id: 21,
    question_type: "written",
    diagram_svg: Q21_GRID,
    question: `A product designer is creating a poster.
(a) The designer creates a 6-colour bitmap image as shown above. Each colour is represented by a letter: R=red, P=purple, G=green, B=blue, W=white, O=orange.

(i) State the minimum number of bits needed to represent each pixel in the image.
(ii) Calculate the minimum file size in bytes for this 6×6 pixel image.

(b) Explain how RLE would compress this image.
(c) Calculate the file size in GB for a 50000×50000 pixel image with 4 bytes per pixel.`,
    markscheme: `(a)(i) [1] 3 bits (6 colours: 2^2=4 not enough, 2^3=8 ✓)
(a)(ii) [2] 36 pixels × 3 bits = 108 bits = 13.5 bytes (accept 14 bytes)
(b) [3] RLE looks for consecutive pixels of the same colour; stores colour value and count; e.g. R2 P3 G1 for first row
(c) [4] 50000×50000=2,500,000,000 pixels; ×4=10,000,000,000 bytes; ÷1024³≈9.3GB (accept 10GB)`,
  },
  {
    id: 22,
    question_type: "written",
    diagram_svg: Q22_REG,
    question: `Register X contains the following 8-bit value:

[Register X: 1 1 1 1 0 0 1 0]

(i) The contents of X represent an unsigned binary integer. Convert the value into denary.
(ii) Convert the value into hexadecimal.
(iii) The contents of X represent a two's complement binary integer. Convert the value into denary.`,
    markscheme: `(i) [1] 242
(ii) [1] F2
(iii) [1] -14`,
  },
  {
    id: 23,
    question_type: "written",
    question: `(a) Define sampling rate and explain its influence on the accuracy of a digital sound recording.
(b) Define pixel and screen resolution.
(c) How many pixels can be stored in one byte for a monochrome (black and white) image?
(d) Calculate the file size in KB for a bitmap image that is 2048×512 pixels with 256 colours.
(e) State one extra data item stored in a bitmap file header.`,
    markscheme: `(a) [2] Sampling rate = number of samples taken per second; higher sampling rate → more accurate representation of the original sound
(b) [2] Pixel = smallest addressable picture element in a bitmap image; Screen resolution = number of pixels displayed horizontally and vertically
(c) [1] 8 pixels (1 bit per pixel, 8 bits per byte)
(d) [3] 256 colours = 8 bits = 1 byte per pixel; 2048×512=1,048,576 pixels; ×1 byte=1,048,576 bytes=1024KB
(e) [1] Any one of: file type, file size, image dimensions, colour depth`,
  },
  {
    id: 24,
    question_type: "written",
    question: `(a) Define sampling resolution and explain its effect on the accuracy of a digital sound recording.
(b) Define image resolution and state the minimum number of bits per pixel for an image with 16 different colours.
(c) Calculate the file size in KB for a bitmap image that is 8192×256 pixels with 256 different colours.
(d) State two items of data stored in a file header.`,
    markscheme: `(a) [2] Sampling resolution = number of bits used to represent each sample; higher sampling resolution → more accurate representation / smaller quantisation error
(b) [2] Image resolution = number of pixels per unit of length; 4 bits per pixel (2^4=16)
(c) [3] 256 colours=8 bits=1 byte; 8192×256=2,097,152 pixels; ×1 byte=2097152 bytes=2048KB
(d) [2] Any two of: file type, file size, image dimensions (width/height), colour depth`,
  },
  {
    id: 25,
    question_type: "written",
    question: `(a) Define sampling rate and explain its influence on the accuracy of a digital recording.
(b) Define pixel and screen resolution. How many pixels can be stored per byte for a monochrome image?
(c) Calculate the file size in KB for a bitmap image that is 2048×512 pixels with 256 colours.`,
    markscheme: `(a) [2] Sampling rate = number of samples taken per second; higher rate → more accurate, larger file
(b) [3] Pixel = smallest picture element; screen resolution = number of pixels in horizontal and vertical dimensions; 8 pixels per byte (1 bit each)
(c) [3] 2048×512=1,048,576 pixels; 256 colours=1 byte/pixel; 1,048,576 bytes=1024KB`,
  },
  {
    id: 26,
    question_type: "written",
    diagram_svg: Q26_BCD,
    question: `(a) Two's complement representation:
(i) Convert 01110111 to denary.
(ii) Convert 10001000 to denary (two's complement).
(iii) Represent -17 in 8-bit two's complement.
(iv) State the range of values that can be stored in a single byte using two's complement.

(b) Binary Coded Decimal (BCD):
(i) Represent the number 653 in BCD form.
(ii) The following 12-bit value is claimed to be a BCD representation:

[0 1 0 0 1 1 1 0 0 0 1 0]

Explain why this is NOT a valid BCD value.
(iii) State one practical use of BCD number representation.`,
    markscheme: `(a)(i) [1] 119
(a)(ii) [1] -120
(a)(iii) [1] 1110 1111
(a)(iv) [1] -128 to +127
(b)(i) [1] 0110 0101 0011
(b)(ii) [1] Second group 1110 represents 14 in denary which is greater than 9, so it is not a valid BCD digit
(b)(iii) [1] Calculator display / digital clock / anywhere exact decimal representation is needed`,
  },
  {
    id: 27,
    question_type: "written",
    diagram_svg: Q27_REGS,
    question: `(a) Convert the denary integer 55 into 8-bit binary. Write your answer in the register boxes above.
(b) Convert the following Binary Coded Decimal (BCD) number into denary: 10000011
(c) Convert the denary integer -102 into 8-bit two's complement. Write your answer in the register boxes above.
(d) Convert the hexadecimal number 4E into denary.`,
    markscheme: `(a) [1] 00110111
(b) [1] 83
(c) [2] 10011010
(d) [2] 78`,
  },
  {
    id: 28,
    question_type: "written",
    question: `A school has a radio station.
(a) Describe how sound clips are sampled and digitally encoded.
(b) Is lossy or lossless compression more appropriate for a sound clip? Justify your choice.
(c) Explain how run-length encoding (RLE) works.`,
    markscheme: `(a) [3] Amplitude of sound wave measured at regular time intervals; each measurement encoded as a binary number; sequence of numbers forms the digital file
(b) [3] Lossy is more appropriate; human ear will not notice loss of quality; produces a smaller file suitable for streaming/transmission
(c) [3] RLE identifies consecutive pixels/data items with the same value; stores the value once along with a count of how many times it repeats; this is more efficient than storing each item individually`,
  },
  {
    id: 29,
    question_type: "written",
    question: `(a) Convert the binary number 01001101 to denary.
(b) Represent the denary number 82 in BCD form.
(c) Convert the binary number 11001011 as a two's complement value to denary.
(d) Convert the denary number 198 to hexadecimal.`,
    markscheme: `(a) [1] 77
(b) [1] 1000 0010
(c) [2] -53
(d) [2] C6`,
  },
  {
    id: 30,
    question_type: "written",
    question: `(a) Convert the denary number 46 into:
(i) 8-bit binary
(ii) 8-bit two's complement representation of -46
(iii) Hexadecimal

(b) Explain how to convert a denary number to BCD form, and how to convert BCD back to denary. Give an example of each.`,
    markscheme: `(a)(i) [1] 00101110
(a)(ii) [1] 11010010
(a)(iii) [1] 2E
(b) [4] Denary to BCD: convert each denary digit separately into 4-bit binary e.g. 46 → 0100 0110. BCD to denary: split into groups of 4 bits and convert each group to denary e.g. 0011 0111 → 3 and 7 → 37`,
  },
  {
    id: 31,
    question_type: "written",
    question: `(a) Define the term frame rate in the context of video.
(b) Describe the difference between interlaced encoding and progressive encoding of video.`,
    markscheme: `(a) [1] The number of frames/images that are displayed or recorded per second
(b) [4] Interlaced: each frame divided into two fields containing alternate (odd/even) rows; fields displayed alternately; viewer sees combined data from two frames simultaneously. Progressive: complete image captured and stored for each frame; all rows captured at the same time; rate of display equals the frame rate`,
  },
  {
    id: 32,
    question_type: "written",
    question: `(i) Name the video terms described below:
- "Pixels in two consecutive video frames have the same value in the same location. There is duplication of data between frames."
- "A sequence of pixels in a single video frame have the same value."

(ii) Give one file technique that could be applied when either of these features are present.`,
    markscheme: `(i) [2] First description: temporal redundancy. Second description: spatial redundancy
(ii) [1] (File) compression / run-length encoding`,
  },
  {
    id: 33,
    question_type: "matching",
    diagram_svg: Q33_MATCHING,
    question: `Hexadecimal, BCD and binary values are shown on the left. Draw a line to link each value to its correct denary value on the right.

Left column:
- Hexadecimal: 3A
- BCD representation: 0100 1001
- Binary integer: 01011101
- Two's complement binary integer: 11000001

Right column (denary values): 93, -65, 58, -63, 73, 49, -93`,
    markscheme: `[4] Hexadecimal 3A → 58; BCD 0100 1001 → 49; Binary 01011101 → 93; Two's complement 11000001 → -63. Award 1 mark per correct match.`,
  },
  {
    id: 34,
    question_type: "written",
    diagram_svg: Q34_REGS,
    question: `1(i) Convert the following binary number into hexadecimal: 10111000

(ii) Convert the following denary number into BCD format: 97

(iii) Using two's complement, show how the following denary numbers could be stored in an 8-bit register. Write your answers in the register boxes above.
- 114
- -93`,
    markscheme: `(i) [1] B8
(ii) [1] 1001 0111
(iii) [2] 114 = 01110010; -93 = 10100011`,
  },
  {
    id: 35,
    question_type: "written",
    question: `(a) Define sampling resolution and explain how it affects the accuracy and file size of a digital sound file. State one benefit and one drawback of higher sampling resolution.
(b) Describe two features of sound editing software.
(c) Explain the difference between lossless and lossy compression. Give one example of each.`,
    markscheme: `(a) [4] Sampling resolution = number of bits used per sample; higher resolution → less quantisation error / more accurate; higher resolution → larger file size. Benefit: more accurate reproduction. Drawback: larger file
(b) [2] Any two features with purpose e.g. fade in/out (gradually change volume), mix tracks (combine multiple tracks), change pitch (raise/lower pitch), edit start/end time
(c) [3] Lossless: no data is lost; original can be exactly reconstructed; e.g. RLE, Huffman. Lossy: some data is permanently lost; smaller file; e.g. MP3, JPEG`,
  },
  {
    id: 36,
    question_type: "written",
    diagram_svg: Q36_REGS,
    question: `(a) Using two's complement, show how the following denary numbers could be stored in an 8-bit register. Write your answers in the register boxes above.
- 124
- -77

(b) Convert both numbers into hexadecimal:
124 = ......
-77 = ......

(c)(i) Represent the number 359 in BCD form.
(c)(ii) Describe a use of BCD number representation.`,
    markscheme: `(a) [2] 124 = 01111100; -77 = 10110011
(b) [2] 124 = 7C; -77 = B3
(c)(i) [1] 0011 0101 1001
(c)(ii) [2] Calculator display / digital clock / any application requiring exact decimal representation without floating-point errors`,
  },
  {
    id: 37,
    question_type: "matching",
    diagram_svg: Q37_MATCHING,
    question: `Six computer graphics terms and seven descriptions are shown. Draw a line to link each term to its correct description.

Terms: Bitmap graphic, Image file header, Image resolution, Pixel, Screen resolution, Vector graphic

Descriptions:
- Measured in dots per inch (dpi); this value determines the amount of detail an image has
- Picture element
- Image made up of rows and columns of picture elements
- Image made up of drawing objects. The properties of each object determine its shape and appearance.
- Specifies the image size, number of colours, and other data needed to display the image data
- Number of samples taken per second to represent some event in a digital format
- Value quoted for a monitor specification, such as 1024 × 768. The larger the numbers, the more picture elements will be displayed.`,
    markscheme: `[6] Bitmap graphic → Image made up of rows and columns of picture elements; Image file header → Specifies the image size, number of colours, and other data; Image resolution → Measured in dots per inch; Pixel → Picture element; Screen resolution → Value quoted for monitor specification e.g. 1024×768; Vector graphic → Image made up of drawing objects. Award 1 mark per correct match.`,
  },
  {
    id: 38,
    question_type: "written",
    diagram_svg: Q38_SCREEN + Q38_MEMORY,
    question: `A touch screen has three squares where a selection can be made: S, T, U.

The x-coordinate of the centre of the three squares is held in three memory locations:
| | Address | Memory contents |
| S | 40 | 0000 1011 0100 |
| T | 41 | 0010 0101 0100 |
| U | 42 | 0100 0110 1100 |

(a)(i) Give the hexadecimal value of the memory contents for U.
(a)(ii) Convert the denary number 40 into binary.`,
    markscheme: `(a)(i) [1] 46C
(a)(ii) [1] 00101000 (or 101000)`,
  },
  {
    id: 39,
    question_type: "written",
    question: `(a) Explain the terms sampling resolution and sampling rate in the context of digital sound.
(b) A CD uses 44100 samples per second, 16 bits per sample, and is stereo (2 channels).
(i) Calculate the number of bytes used per second.
(ii) Explain how to calculate the file size in MB for a 4-minute track. Show your working.`,
    markscheme: `(a) [4] Sampling resolution = number of bits used to represent each sample; higher resolution → more accurate representation. Sampling rate = number of samples per second; higher rate → more accurate
(b)(i) [2] 44100 × 16 × 2 = 1,411,200 bits per second; ÷8 = 176,400 bytes per second
(b)(ii) [2] 176,400 × 240 seconds = 42,336,000 bytes; ÷(1024²) ≈ 40.4MB`,
  },
  {
    id: 40,
    question_type: "written",
    question: `(i) State two disadvantages of using ASCII to represent characters.
(ii) Explain how Unicode overcomes these disadvantages.`,
    markscheme: `(i) [2] ASCII only has 128 (7-bit) or 256 (8-bit) characters; cannot represent characters from many languages / limited character set; extended ASCII is not standardised across systems
(ii) [2] Unicode uses more bits (16, 24 or 32 bits); can represent characters from virtually all languages; is a superset of ASCII so backwards compatible`,
  },
];