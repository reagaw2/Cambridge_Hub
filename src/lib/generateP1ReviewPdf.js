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

/**
 * generateP1ReviewPdf
 *
 * @param {object} params
 *   paperId       string
 *   paperLabel    string
 *   questions     array  — full question objects (text, options, correct, topic, number)
 *   answers       object — { [questionId]: { chosen, correct, flagged_as_guess, layer1? } }
 *   userEmail     string (optional)
 *   examMode      boolean
 */
export async function generateP1ReviewPdf({
  paperId,
  paperLabel,
  questions = [],
  answers = {},
  userEmail = "",
  examMode = false,
}) {
  const JsPDF = await loadJsPDF();

  // ── Page geometry ──────────────────────────────────────────────────────────
  const PW = 210, PH = 297;
  const ML = 18, MR = 18, MT = 20, MB = 22;
  const CW = PW - ML - MR;          // 174 mm content width
  const SAFE_Y = PH - MB;           // lowest safe y position

  const doc = new JsPDF({ unit: "mm", format: "a4" });
  let y = MT;
  let pageNum = 1;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // ── Typography helpers ─────────────────────────────────────────────────────
  const LH = (fs) => (fs / 72) * 25.4 * 1.55;

  function setStyle(family, style, size, r, g, b) {
    doc.setFont(family, style);
    doc.setFontSize(size);
    doc.setTextColor(r ?? 0, g ?? 0, b ?? 0);
  }

  function drawWrapped(text, x, maxW, fs, style, r, g, b) {
    if (!text) return 0;
    setStyle("helvetica", style ?? "normal", fs, r ?? 0, g ?? 0, b ?? 0);
    const lines = doc.splitTextToSize(String(text), maxW);
    const lh = LH(fs);
    lines.forEach(line => {
      checkPage(lh + 1);
      doc.text(line, x, y);
      y += lh;
    });
    doc.setTextColor(0, 0, 0);
    return lines.length * lh;
  }

  function checkPage(needed) {
    if (y + needed > SAFE_Y) {
      drawFooter();
      doc.addPage();
      pageNum++;
      y = MT;
    }
  }

  function drawFooter() {
    setStyle("helvetica", "normal", 7.5, 160, 160, 160);
    doc.text("Cambridge Hub — MCQ Review Report", ML, PH - 11);
    if (userEmail) doc.text(userEmail, PW / 2, PH - 11, { align: "center" });
    doc.text(`Page ${pageNum}`, PW - MR, PH - 11, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  function hRule(alpha = 200) {
    doc.setDrawColor(alpha, alpha, alpha);
    doc.setLineWidth(0.25);
    doc.line(ML, y, PW - MR, y);
    doc.setDrawColor(0, 0, 0);
    y += 3.5;
  }

  function boldRule() {
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.7);
    doc.line(ML, y, PW - MR, y);
    doc.setDrawColor(0, 0, 0);
    y += 5;
  }

  // ── Build topic stats ──────────────────────────────────────────────────────
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

  // Failed = wrong or guessed
  const failedQuestions = questions.filter(q => {
    const a = answers[q.id];
    return a && (!a.correct || a.flagged_as_guess);
  });

  // Topics sorted weakest first
  const topicsSorted = Object.entries(topicMap).sort((a, b) => {
    const pA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
    const pB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
    return pA - pB;
  });

  const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Satisfactory" : "Needs Work";

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Cover + Summary + Topic Analysis
  // ══════════════════════════════════════════════════════════════════════════

  // Header
  setStyle("helvetica", "bold", 15, 20, 20, 20);
  doc.text("Cambridge Hub", ML, y);
  setStyle("helvetica", "normal", 9, 110, 110, 110);
  doc.text("MCQ Review Report", ML + 52, y + 0.5);
  doc.text(dateStr, PW - MR, y, { align: "right" });
  y += 5.5;

  setStyle("helvetica", "normal", 8.5, 80, 80, 80);
  const modeLine = examMode ? "Timed Exam Mode" : "Practice Mode";
  doc.text(`${paperLabel}  ·  ${modeLine}`, ML, y);
  if (userEmail) { doc.text(userEmail, PW - MR, y, { align: "right" }); }
  doc.setTextColor(0, 0, 0);
  y += 5;

  boldRule();

  // ── Score hero ─────────────────────────────────────────────────────────────
  checkPage(28);
  const heroY = y;
  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(210, 220, 235);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, heroY, CW, 24, 3, 3, "FD");

  // Big score
  setStyle("helvetica", "black", 22, 20, 20, 20);
  doc.text(`${totalCorrect} / ${questions.length}`, ML + 6, heroY + 10);

  setStyle("helvetica", "bold", 11, 60, 60, 60);
  doc.text(`${pct}%  —  ${grade}`, ML + 6, heroY + 18);

  // Stats on right
  const statsX = ML + CW * 0.52;
  const statRows = [
    [`✓ Correct:`,    String(totalCorrect), [22, 163, 74]],
    [`✗ Wrong:`,      String(totalWrong),   [210, 38, 38]],
    [`🎲 Guessed:`,   String(totalGuessed), [217, 119, 6]],
    [`— Blank:`,      String(totalBlank),   [130, 130, 130]],
  ];
  let sY = heroY + 5;
  statRows.forEach(([label, val, col]) => {
    setStyle("helvetica", "normal", 8.5, 80, 80, 80);
    doc.text(label, statsX, sY);
    setStyle("helvetica", "bold", 8.5, ...col);
    doc.text(val, statsX + 26, sY);
    sY += 5;
  });

  doc.setTextColor(0, 0, 0);
  y = heroY + 28;

  // ── Topic Analysis ─────────────────────────────────────────────────────────
  y += 5;
  checkPage(12 + topicsSorted.length * 14);

  setStyle("helvetica", "bold", 8, 100, 100, 100);
  doc.text("TOPIC ANALYSIS  ·  WEAKEST FIRST", ML, y);
  y += 5.5;

  const BAR_H    = 4;
  const BAR_W    = CW * 0.55;
  const LABEL_W  = CW * 0.42;
  const STAT_W   = CW * 0.13;

  topicsSorted.forEach(([topic, { correct, total }]) => {
    const topicPct = total > 0 ? correct / total : 0;
    const barFill = BAR_W * topicPct;
    const pctInt  = Math.round(topicPct * 100);

    const barColor =
      pctInt >= 70 ? [34, 197, 94]  :
      pctInt >= 50 ? [251, 146, 60] :
                     [248, 113, 113];

    checkPage(12);

    // Label
    setStyle("helvetica", "normal", 8.5, 30, 30, 30);
    const topicLines = doc.splitTextToSize(topic, LABEL_W);
    doc.text(topicLines[0], ML, y + 3);

    // Stat
    setStyle("helvetica", "bold", 8.5, ...barColor);
    doc.text(`${correct}/${total}  (${pctInt}%)`, PW - MR - STAT_W, y + 3, { align: "right" });

    // Bar track
    doc.setFillColor(225, 230, 240);
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.2);
    doc.roundedRect(ML + LABEL_W + 4, y, BAR_W, BAR_H, 1.5, 1.5, "FD");

    // Bar fill
    if (barFill > 0.5) {
      doc.setFillColor(...barColor);
      doc.setDrawColor(...barColor);
      doc.roundedRect(ML + LABEL_W + 4, y, barFill, BAR_H, 1.5, 1.5, "F");
    }

    doc.setTextColor(0, 0, 0);
    y += 12;
  });

  // ── Weakness summary sentence ──────────────────────────────────────────────
  y += 2;
  const weakTopics = topicsSorted.filter(([, { correct, total }]) => total > 0 && (correct / total) < 0.5).map(([t]) => t);
  if (weakTopics.length > 0) {
    checkPage(12);
    doc.setFillColor(255, 248, 235);
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.4);
    const warnH = weakTopics.length <= 2 ? 10 : 14;
    doc.roundedRect(ML, y, CW, warnH, 2, 2, "FD");
    setStyle("helvetica", "bold", 8, 140, 80, 0);
    doc.text("⚠ Focus areas:", ML + 4, y + 5);
    setStyle("helvetica", "normal", 8, 100, 55, 0);
    const weakStr = weakTopics.slice(0, 4).join("  ·  ");
    const weakLines = doc.splitTextToSize(weakStr, CW - 32);
    weakLines.forEach((l, i) => doc.text(l, ML + 30, y + 5 + i * 4.5));
    doc.setTextColor(0, 0, 0);
    y += warnH + 5;
  }

  boldRule();

  // ── Section header ─────────────────────────────────────────────────────────
  checkPage(12);
  setStyle("helvetica", "bold", 9.5, 20, 20, 20);
  doc.text("Failed Questions", ML, y);
  setStyle("helvetica", "normal", 8.5, 120, 120, 120);
  doc.text(`${failedQuestions.length} question${failedQuestions.length !== 1 ? "s" : ""} to review`, ML + 38, y + 0.5);
  doc.setTextColor(0, 0, 0);
  y += 6;

  if (failedQuestions.length === 0) {
    checkPage(14);
    setStyle("helvetica", "italic", 10, 100, 100, 100);
    doc.text("🎉 No failed questions — perfect score!", ML, y);
    y += 8;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FAILED QUESTION ENTRIES
  // ══════════════════════════════════════════════════════════════════════════

  const OPTION_KEYS = ["A", "B", "C", "D"];
  const NUM_RULES   = 4;
  const RULE_GAP    = 8;

  failedQuestions.forEach((q, qi) => {
    const a        = answers[q.id];
    const chosen   = a?.chosen ?? null;
    const correct  = q.correct;
    const isGuess  = a?.flagged_as_guess ?? false;
    const layer1   = a?.layer1 ?? null;

    checkPage(55); // rough minimum per question

    // ── Question header card ───────────────────────────────────────────────
    const hY = y;
    doc.setFillColor(235, 242, 255);
    doc.setDrawColor(180, 200, 235);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, hY, CW, 14, 2.5, 2.5, "FD");

    setStyle("helvetica", "bold", 8.5, 25, 60, 130);
    doc.text(`Q${q.number}`, ML + 4, hY + 6);

    setStyle("helvetica", "normal", 8, 60, 80, 130);
    doc.text(q.topic, ML + 14, hY + 6);

    const statusText = isGuess ? "🎲 Guessed" : "✗ Wrong";
    const statusColor = isGuess ? [180, 100, 0] : [190, 30, 30];
    setStyle("helvetica", "bold", 8, ...statusColor);
    doc.text(statusText, PW - MR - 2, hY + 6, { align: "right" });

    doc.setTextColor(0, 0, 0);
    y = hY + 17;

    // ── Question text ──────────────────────────────────────────────────────
    drawWrapped(q.text, ML, CW, 9.5, "normal", 20, 20, 20);
    y += 3;

    // ── Options ────────────────────────────────────────────────────────────
    OPTION_KEYS.forEach(k => {
      const optText = q.options?.[k];
      if (!optText) return;

      const isCorrectOpt = k === correct;
      const isChosenWrong = k === chosen && !isCorrectOpt;

      let bgR = 248, bgG = 248, bgB = 248;
      let borderR = 210, borderG = 210, borderB = 210;
      let labelR = 90, labelG = 90, labelB = 90;

      if (isCorrectOpt) {
        bgR = 230; bgG = 250; bgB = 237;
        borderR = 100; borderG = 200; borderB = 130;
        labelR = 22; labelG = 120; labelB = 55;
      } else if (isChosenWrong) {
        bgR = 254; bgG = 235; bgB = 235;
        borderR = 220; borderG = 130; borderB = 130;
        labelR = 180; labelG = 30; labelB = 30;
      }

      const optLines = doc.splitTextToSize(`${k}.  ${optText}`, CW - 10);
      const optH = Math.max(8, optLines.length * LH(9) + 4);

      checkPage(optH + 2);

      doc.setFillColor(bgR, bgG, bgB);
      doc.setDrawColor(borderR, borderG, borderB);
      doc.setLineWidth(0.35);
      doc.roundedRect(ML, y, CW, optH, 1.5, 1.5, "FD");

      setStyle("helvetica", isCorrectOpt ? "bold" : "normal", 9, labelR, labelG, labelB);
      const prefix = isCorrectOpt ? "✓" : isChosenWrong ? "✗" : " ";
      optLines.forEach((line, li) => {
        const lineX = li === 0 ? ML + 3 : ML + 8;
        const lineText = li === 0 ? `${prefix}  ${line}` : line;
        doc.text(lineText, lineX, y + 5 + li * LH(9));
      });

      doc.setTextColor(0, 0, 0);
      y += optH + 2;
    });

    y += 2;

    // ── AI Feedback (practice mode only) ──────────────────────────────────
    if (layer1) {
      if (layer1.pulse_layer_1) {
        checkPage(18);
        doc.setFillColor(234, 250, 240);
        doc.setDrawColor(100, 195, 130);
        doc.setLineWidth(0.4);
        const tkLines = doc.splitTextToSize(layer1.pulse_layer_1, CW - 10);
        const tkH = tkLines.length * LH(9) + 10;
        doc.roundedRect(ML, y, CW, tkH, 2, 2, "FD");
        setStyle("helvetica", "bold", 7.5, 25, 100, 50);
        doc.text("📌 EXAM TAKEAWAY", ML + 4, y + 5.5);
        setStyle("helvetica", "bold", 9, 15, 80, 40);
        tkLines.forEach((line, li) => doc.text(line, ML + 4, y + 10 + li * LH(9)));
        doc.setTextColor(0, 0, 0);
        y += tkH + 3;
      }

      if (layer1.cambridge_insight) {
        checkPage(16);
        doc.setFillColor(246, 248, 252);
        doc.setDrawColor(200, 210, 230);
        doc.setLineWidth(0.35);
        const ciLines = doc.splitTextToSize(layer1.cambridge_insight, CW - 10);
        const ciH = ciLines.length * LH(9) + 10;
        doc.roundedRect(ML, y, CW, ciH, 2, 2, "FD");
        setStyle("helvetica", "bold", 7.5, 90, 90, 110);
        doc.text("CAMBRIDGE INSIGHT", ML + 4, y + 5.5);
        setStyle("helvetica", "normal", 9, 40, 40, 60);
        ciLines.forEach((line, li) => doc.text(line, ML + 4, y + 10 + li * LH(9)));
        doc.setTextColor(0, 0, 0);
        y += ciH + 3;
      }
    }

    y += 3;

    // ── Reflection ruled sections ─────────────────────────────────────────
    const reflSections = [
      "What I Thought Was True",
      "What I Now Understand",
    ];

    reflSections.forEach((heading, ri) => {
      const boxH = NUM_RULES * RULE_GAP + 16;
      checkPage(boxH + 6);

      doc.setFillColor(252, 252, 250);
      doc.setDrawColor(200, 200, 195);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW, boxH, 2, 2, "FD");

      setStyle("helvetica", "bold", 8.5, 25, 25, 25);
      doc.text(heading, ML + 4, y + 7);

      setStyle("helvetica", "italic", 7.5, 160, 160, 160);
      doc.text("(fill in by hand)", PW - MR - 2, y + 7, { align: "right" });

      doc.setDrawColor(180, 178, 170);
      doc.setLineWidth(0.22);
      for (let i = 0; i < NUM_RULES; i++) {
        const lineY = y + 13 + i * RULE_GAP;
        doc.line(ML + 4, lineY, PW - MR - 4, lineY);
      }

      doc.setTextColor(0, 0, 0);
      y += boxH + (ri === 0 ? 4 : 8);
    });

    // ── Divider between questions ─────────────────────────────────────────
    if (qi < failedQuestions.length - 1) {
      checkPage(8);
      doc.setDrawColor(215, 215, 215);
      doc.setLineWidth(0.3);
      doc.line(ML, y, PW - MR, y);
      y += 8;
      doc.setDrawColor(0, 0, 0);
    }
  });

  drawFooter();

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeLabel = (paperLabel ?? paperId ?? "review")
    .replace(/[^\w]/g, "_").replace(/_+/g, "_").slice(0, 40);
  const filename = `MCQ_Review_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); }
  catch { window.open(doc.output("bloburl"), "_blank"); }
}