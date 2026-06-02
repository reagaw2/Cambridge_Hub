const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

async function loadJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = JSPDF_CDN;
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/** Strip / replace unicode characters that jsPDF helvetica cannot render */
function sanitise(str) {
  if (!str) return "";
  return String(str)
    // superscripts
    .replace(/\u00b2/g, "^2").replace(/\u00b3/g, "^3")
    .replace(/\u00b9/g, "^1").replace(/\u2070/g, "^0")
    .replace(/[\u2071-\u2079]/g, (c) => "^" + (c.codePointAt(0) - 0x2070))
    // subscripts
    .replace(/[\u2080-\u2089]/g, (c) => "_" + (c.codePointAt(0) - 0x2080))
    // common symbols
    .replace(/\u00d7/g, "x").replace(/\u00f7/g, "/")
    .replace(/\u2212/g, "-").replace(/\u2013/g, "-").replace(/\u2014/g, "--")
    .replace(/\u2260/g, "!=").replace(/\u2264/g, "<=").replace(/\u2265/g, ">=")
    .replace(/\u03b1/g, "alpha").replace(/\u03b2/g, "beta")
    .replace(/\u03b3/g, "gamma").replace(/\u03c9/g, "omega")
    .replace(/\u03bc/g, "mu").replace(/\u03c1/g, "rho")
    .replace(/\u03b5/g, "epsilon").replace(/\u03bb/g, "lambda")
    // arrows
    .replace(/\u2192/g, "->").replace(/\u2190/g, "<-")
    // degree
    .replace(/\u00b0/g, " deg")
    // any remaining non-Latin-1 (safe fallback)
    .replace(/[^\x00-\xFF]/g, " ");
}

export async function generateP1ReviewPdf({
  paperId,
  paperLabel,
  questions = [],
  answers = {},
  userEmail = "",
  examMode = false,
}) {
  const JsPDF = await loadJsPDF();

  // ── Page constants ─────────────────────────────────────────────────────────
  const PW = 210, PH = 297;
  const ML = 16, MR = 16;
  const CW = PW - ML - MR;   // 178 mm
  const MT = 18, MB = 20;
  const SAFE_Y = PH - MB;

  const doc = new JsPDF({ unit: "mm", format: "a4" });
  let y = MT;
  let pageNum = 1;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const LH = (fs) => (fs / 72) * 25.4 * 1.6;

  function text(str, x, ty, opts) {
    doc.text(sanitise(str), x, ty, opts);
  }

  function wrap(str, maxW, fs) {
    return doc.splitTextToSize(sanitise(str), maxW);
  }

  function setF(style, size, r, g, b) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(r ?? 0, g ?? 0, b ?? 0);
  }

  function checkPage(needed) {
    if (y + needed > SAFE_Y) {
      footer();
      doc.addPage();
      pageNum++;
      y = MT;
    }
  }

  function footer() {
    setF("normal", 7.5, 150, 150, 150);
    text("Cambridge Hub  -  MCQ Review Report", ML, PH - 10);
    if (userEmail) text(userEmail, PW / 2, PH - 10, { align: "center" });
    text(`Page ${pageNum}`, PW - MR, PH - 10, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  function boldRule() {
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.6);
    doc.line(ML, y, PW - MR, y);
    doc.setDrawColor(0);
    y += 5;
  }

  function lightRule() {
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.25);
    doc.line(ML, y, PW - MR, y);
    doc.setDrawColor(0);
    y += 5;
  }

  // ── Statistics ─────────────────────────────────────────────────────────────
  const topicMap = {};
  questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total++;
    const a = answers[q.id];
    if (a?.correct && !a?.flagged_as_guess) topicMap[q.topic].correct++;
  });

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect  = Object.values(answers).filter(a => a.correct && !a.flagged_as_guess).length;
  const totalGuessed  = Object.values(answers).filter(a => a.flagged_as_guess).length;
  const totalWrong    = Object.values(answers).filter(a => !a.correct && !a.flagged_as_guess).length;
  const totalBlank    = questions.length - totalAnswered;
  const pct = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  const failedQs = questions.filter(q => {
    const a = answers[q.id];
    return a && (!a.correct || a.flagged_as_guess);
  });

  const topicsSorted = Object.entries(topicMap).sort((a, b) => {
    const pA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
    const pB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
    return pA - pB;
  });

  const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Satisfactory" : "Needs Work";
  const weakTopics = topicsSorted.filter(([, { correct, total }]) => total > 0 && correct / total < 0.5).map(([t]) => t);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Header
  // ══════════════════════════════════════════════════════════════════════════

  setF("bold", 16, 20, 20, 20);
  text("Cambridge Hub", ML, y);
  setF("normal", 9, 110, 110, 110);
  text("MCQ Review Report", ML + 54, y + 0.5);
  text(dateStr, PW - MR, y, { align: "right" });
  y += 5.5;

  setF("normal", 8.5, 80, 80, 80);
  text(`${sanitise(paperLabel)}   |   ${examMode ? "Timed Exam" : "Practice Mode"}`, ML, y);
  if (userEmail) text(sanitise(userEmail), PW - MR, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 5;

  boldRule();

  // ── Score hero ─────────────────────────────────────────────────────────────
  checkPage(30);
  const heroY = y;

  doc.setFillColor(243, 246, 252);
  doc.setDrawColor(205, 215, 235);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, heroY, CW, 26, 3, 3, "FD");

  // Score large
  setF("bold", 24, 15, 25, 80);
  text(`${totalCorrect} / ${questions.length}`, ML + 5, heroY + 11);

  setF("bold", 11, 50, 60, 100);
  text(`${pct}%   -   ${grade}`, ML + 5, heroY + 20);

  // Stats block on the right
  const sX = ML + CW * 0.52;
  const statData = [
    ["Correct",  `${totalCorrect}`,  [22, 163, 74]],
    ["Wrong",    `${totalWrong}`,    [210, 38, 38]],
    ["Guessed",  `${totalGuessed}`,  [217, 119, 6]],
    ["Blank",    `${totalBlank}`,    [130, 130, 130]],
  ];
  let sY = heroY + 5;
  statData.forEach(([label, val, col]) => {
    setF("normal", 8.5, 90, 90, 90);
    text(label + ":", sX, sY);
    setF("bold", 8.5, ...col);
    text(val, sX + 28, sY);
    sY += 5.2;
  });
  doc.setTextColor(0, 0, 0);
  y = heroY + 30;

  // ── Topic Analysis ─────────────────────────────────────────────────────────
  checkPage(14 + topicsSorted.length * 13);

  setF("bold", 8, 90, 90, 100);
  text("TOPIC ANALYSIS  (weakest first)", ML, y);
  y += 6;

  const LABEL_MAX = CW * 0.40;
  const BAR_X    = ML + LABEL_MAX + 6;
  const BAR_W    = CW * 0.44;
  const BAR_H    = 3.8;

  topicsSorted.forEach(([topic, { correct, total }]) => {
    const tp = total > 0 ? correct / total : 0;
    const pctInt = Math.round(tp * 100);
    const barFill = BAR_W * tp;

    const col =
      pctInt >= 70 ? [34, 197, 94] :
      pctInt >= 50 ? [251, 146, 60] :
                     [239, 68, 68];

    checkPage(12);

    // Topic label — truncate if too long
    setF("normal", 8.5, 30, 30, 30);
    const labelLines = doc.splitTextToSize(sanitise(topic), LABEL_MAX);
    doc.text(labelLines[0], ML, y + 3);

    // Stat text right-aligned
    setF("bold", 8.5, ...col);
    text(`${correct}/${total} (${pctInt}%)`, PW - MR, y + 3, { align: "right" });

    // Bar track
    doc.setFillColor(220, 225, 235);
    doc.setDrawColor(205, 210, 225);
    doc.setLineWidth(0.2);
    doc.roundedRect(BAR_X, y, BAR_W, BAR_H, 1.5, 1.5, "FD");

    // Bar fill
    if (barFill > 1) {
      doc.setFillColor(...col);
      doc.roundedRect(BAR_X, y, barFill, BAR_H, 1.5, 1.5, "F");
    }

    doc.setTextColor(0, 0, 0);
    y += 11;
  });

  // ── Focus areas callout ────────────────────────────────────────────────────
  if (weakTopics.length > 0) {
    y += 2;
    checkPage(14);
    const warnStr = sanitise(weakTopics.slice(0, 5).join("  |  "));
    const warnLines = doc.splitTextToSize(warnStr, CW - 28);
    const warnH = warnLines.length * LH(8) + 12;
    doc.setFillColor(255, 248, 230);
    doc.setDrawColor(245, 185, 60);
    doc.setLineWidth(0.5);
    doc.roundedRect(ML, y, CW, warnH, 2.5, 2.5, "FD");
    setF("bold", 8, 160, 100, 0);
    text("[!] Topics to focus on:", ML + 4, y + 6);
    setF("normal", 8, 120, 70, 0);
    warnLines.forEach((l, i) => doc.text(l, ML + 4, y + 11 + i * LH(8)));
    doc.setTextColor(0, 0, 0);
    y += warnH + 6;
  }

  boldRule();

  // ── Failed questions section header ────────────────────────────────────────
  checkPage(10);
  setF("bold", 10, 20, 20, 20);
  text("Failed Questions", ML, y);
  setF("normal", 8.5, 120, 120, 120);
  text(`${failedQs.length} question${failedQs.length !== 1 ? "s" : ""} to review`, ML + 42, y + 0.5);
  doc.setTextColor(0, 0, 0);
  y += 7;

  if (failedQs.length === 0) {
    checkPage(10);
    setF("italic", 10, 80, 80, 80);
    text("No failed questions - perfect score!", ML, y);
    y += 8;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FAILED QUESTION ENTRIES
  // ══════════════════════════════════════════════════════════════════════════

  const OPTS = ["A", "B", "C", "D"];
  const NUM_RULES = 4;
  const RULE_GAP  = 9;

  failedQs.forEach((q, qi) => {
    const a       = answers[q.id];
    const chosen  = a?.chosen ?? null;
    const correct = q.correct;
    const isGuess = a?.flagged_as_guess ?? false;
    const layer1  = a?.layer1 ?? null;

    checkPage(60);

    // ── Question header card ───────────────────────────────────────────────
    // Fixed height = 14 mm; label left, status tag right — both baseline-aligned
    const cardH = 14;
    doc.setFillColor(233, 241, 255);
    doc.setDrawColor(175, 200, 235);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, CW, cardH, 2.5, 2.5, "FD");

    // Q-number
    setF("bold", 9, 20, 55, 130);
    text(`Q${q.number}`, ML + 4, y + 9);

    // Topic — clipped so it doesn't bleed into the status tag
    setF("normal", 8, 55, 75, 130);
    const topicSafe = sanitise(q.topic);
    const topicLines = doc.splitTextToSize(topicSafe, CW - 60);
    text(topicLines[0], ML + 18, y + 9);

    // Status pill — right-aligned, same vertical centre
    const statusLabel = isGuess ? "GUESSED" : "WRONG";
    const statusR = isGuess ? [200, 110, 0] : [195, 30, 30];
    const pillW = isGuess ? 22 : 18;
    const pillX = ML + CW - pillW - 3;
    const pillY = y + (cardH - 6) / 2;
    doc.setFillColor(isGuess ? 255 : 254, isGuess ? 237 : 230, isGuess ? 200 : 230);
    doc.setDrawColor(...statusR);
    doc.setLineWidth(0.4);
    doc.roundedRect(pillX, pillY, pillW, 6, 1.5, 1.5, "FD");
    setF("bold", 7, ...statusR);
    text(statusLabel, pillX + pillW / 2, pillY + 4.2, { align: "center" });

    doc.setTextColor(0, 0, 0);
    y += cardH + 4;

    // ── Question text ──────────────────────────────────────────────────────
    const qLines = wrap(q.text, CW, 9.5);
    const qH = qLines.length * LH(9.5);
    checkPage(qH + 4);
    setF("normal", 9.5, 20, 20, 20);
    qLines.forEach(line => { doc.text(line, ML, y); y += LH(9.5); });
    y += 4;

    // ── Options ────────────────────────────────────────────────────────────
    OPTS.forEach(k => {
      const optRaw = q.options?.[k];
      if (!optRaw) return;

      const isCorrectOpt  = k === correct;
      const isChosenWrong = k === chosen && !isCorrectOpt;
      const isNeutral     = !isCorrectOpt && !isChosenWrong;

      // Colour scheme
      let bgR = 248, bgG = 248, bgB = 248;
      let brR = 210, brG = 210, brB = 210;
      let txtR = 70, txtG = 70, txtB = 70;

      if (isCorrectOpt) {
        bgR = 228; bgG = 250; bgB = 234;
        brR = 90;  brG = 195; brB = 120;
        txtR = 15; txtG = 100; txtB = 40;
      } else if (isChosenWrong) {
        bgR = 255; bgG = 232; bgB = 232;
        brR = 215; brG = 110; brB = 110;
        txtR = 170; txtG = 25; txtB = 25;
      }

      // Option text with key prefix
      const prefixLabel = isCorrectOpt ? "[CORRECT]" : isChosenWrong ? "[YOUR ANSWER]" : "";
      const optDisplay = sanitise(`${k}.  ${optRaw}`);
      const optLines = doc.splitTextToSize(optDisplay, CW - 10);
      const optH = Math.max(9, optLines.length * LH(9) + 5);

      checkPage(optH + 2);

      doc.setFillColor(bgR, bgG, bgB);
      doc.setDrawColor(brR, brG, brB);
      doc.setLineWidth(0.35);
      doc.roundedRect(ML, y, CW, optH, 1.8, 1.8, "FD");

      // Left accent bar for correct/wrong
      if (isCorrectOpt) {
        doc.setFillColor(90, 195, 120);
        doc.roundedRect(ML, y, 2.5, optH, 1, 1, "F");
      } else if (isChosenWrong) {
        doc.setFillColor(215, 110, 110);
        doc.roundedRect(ML, y, 2.5, optH, 1, 1, "F");
      }

      // Option text
      setF(isCorrectOpt ? "bold" : "normal", 9, txtR, txtG, txtB);
      const textX = ML + (isCorrectOpt || isChosenWrong ? 5.5 : 3.5);
      optLines.forEach((line, li) => {
        doc.text(line, textX, y + 5.5 + li * LH(9));
      });

      // Label tag (CORRECT / YOUR ANSWER) — right side, vertically centred
      if (prefixLabel) {
        const tagW = isCorrectOpt ? 22 : 28;
        const tagX = ML + CW - tagW - 2;
        const tagY = y + (optH - 5.5) / 2;
        doc.setFillColor(isCorrectOpt ? 90 : 215, isCorrectOpt ? 195 : 110, isCorrectOpt ? 120 : 110);
        doc.roundedRect(tagX, tagY, tagW, 5.5, 1.2, 1.2, "F");
        setF("bold", 6.5, 255, 255, 255);
        text(prefixLabel, tagX + tagW / 2, tagY + 3.8, { align: "center" });
      }

      doc.setTextColor(0, 0, 0);
      y += optH + 2.5;
    });

    y += 2;

    // ── AI Feedback ────────────────────────────────────────────────────────
    if (layer1?.pulse_layer_1) {
      const tkLines = wrap(layer1.pulse_layer_1, CW - 12, 9);
      const tkH = tkLines.length * LH(9) + 13;
      checkPage(tkH + 4);
      doc.setFillColor(232, 250, 240);
      doc.setDrawColor(95, 190, 120);
      doc.setLineWidth(0.4);
      doc.roundedRect(ML, y, CW, tkH, 2, 2, "FD");
      setF("bold", 7.5, 20, 110, 55);
      text("KEY EXAM TAKEAWAY", ML + 5, y + 6);
      setF("bold", 9, 10, 80, 40);
      tkLines.forEach((line, li) => doc.text(line, ML + 5, y + 11 + li * LH(9)));
      doc.setTextColor(0, 0, 0);
      y += tkH + 3;
    }

    if (layer1?.cambridge_insight) {
      const ciLines = wrap(layer1.cambridge_insight, CW - 12, 9);
      const ciH = ciLines.length * LH(9) + 13;
      checkPage(ciH + 4);
      doc.setFillColor(244, 246, 254);
      doc.setDrawColor(185, 195, 230);
      doc.setLineWidth(0.35);
      doc.roundedRect(ML, y, CW, ciH, 2, 2, "FD");
      setF("bold", 7.5, 80, 85, 130);
      text("CAMBRIDGE INSIGHT", ML + 5, y + 6);
      setF("normal", 9, 40, 45, 90);
      ciLines.forEach((line, li) => doc.text(line, ML + 5, y + 11 + li * LH(9)));
      doc.setTextColor(0, 0, 0);
      y += ciH + 3;
    }

    y += 3;

    // ── Reflection boxes ───────────────────────────────────────────────────
    ["What I Thought Was True", "What I Now Understand"].forEach((heading, ri) => {
      const boxH = NUM_RULES * RULE_GAP + 17;
      checkPage(boxH + 5);

      doc.setFillColor(252, 252, 250);
      doc.setDrawColor(198, 196, 190);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW, boxH, 2, 2, "FD");

      setF("bold", 8.5, 30, 30, 30);
      text(heading, ML + 4, y + 8);

      setF("italic", 7.5, 155, 155, 155);
      text("(fill in by hand)", PW - MR - 2, y + 8, { align: "right" });

      doc.setDrawColor(175, 172, 162);
      doc.setLineWidth(0.22);
      for (let i = 0; i < NUM_RULES; i++) {
        doc.line(ML + 4, y + 14 + i * RULE_GAP, PW - MR - 4, y + 14 + i * RULE_GAP);
      }

      doc.setTextColor(0, 0, 0);
      y += boxH + (ri === 0 ? 4 : 9);
    });

    // ── Divider between questions ─────────────────────────────────────────
    if (qi < failedQs.length - 1) {
      checkPage(6);
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(ML, y, PW - MR, y);
      y += 8;
      doc.setDrawColor(0);
    }
  });

  footer();

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = (paperLabel ?? paperId ?? "review")
    .replace(/[^\w]/g, "_").replace(/_+/g, "_").slice(0, 40);
  const filename = `MCQ_Review_${safeName}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); }
  catch { window.open(doc.output("bloburl"), "_blank"); }
}