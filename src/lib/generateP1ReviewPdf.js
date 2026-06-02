import { sanitisePdf } from "@/lib/sanitisePdf";

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

export async function generateP1ReviewPdf({
  paperId,
  paperLabel,
  questions = [],
  answers = {},
  userEmail = "",
  examMode = false,
}) {
  const JsPDF = await loadJsPDF();

  const PW  = 210, PH  = 297;
  const ML  = 18,  MR  = 18,  MT = 20, MB = 22;
  const CW  = PW - ML - MR - 4;
  const SAFE_Y = PH - MB;

  const doc = new JsPDF({ unit: "mm", format: "a4" });
  let y = MT;
  let pageNum = 1;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const LH = (fs) => (fs / 72) * 25.4 * 1.65;

  function setF(style, size, r, g, b) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(r ?? 0, g ?? 0, b ?? 0);
  }

  function txt(str, x, ty, opts) {
    doc.text(sanitisePdf(str), x, ty, opts);
  }

  function wrapLines(str, maxW) {
    return doc.splitTextToSize(sanitisePdf(str), maxW);
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
    txt("Cambridge Hub  -  MCQ Review Report", ML, PH - 11);
    if (userEmail) txt(userEmail, PW / 2, PH - 11, { align: "center" });
    txt(`Page ${pageNum}`, PW - MR, PH - 11, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  function boldRule() {
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + CW + 4, y);
    doc.setDrawColor(0, 0, 0);
    y += 5;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
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
  const pct           = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  // ── All questions that need review: wrong + guessed + blank ───────────────
  const reviewQs = questions.filter(q => {
    const a = answers[q.id];
    if (!a) return true;                          // blank — never answered
    if (!a.correct) return true;                  // wrong answer
    if (a.flagged_as_guess) return true;          // correct but flagged as guess
    return false;
  });

  const topicsSorted = Object.entries(topicMap).sort((a, b) => {
    const pA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
    const pB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
    return pA - pB;
  });

  const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Satisfactory" : "Needs Work";
  const weakTopics = topicsSorted
    .filter(([, { correct, total }]) => total > 0 && correct / total < 0.5)
    .map(([t]) => t);

  // ── Header ─────────────────────────────────────────────────────────────────
  setF("bold", 16, 20, 20, 20);
  txt("Cambridge Hub", ML, y);
  setF("normal", 9, 110, 110, 110);
  txt("MCQ Review Report", ML + 54, y + 0.5);
  txt(dateStr, ML + CW + 4, y, { align: "right" });
  y += 5.5;

  setF("normal", 8.5, 80, 80, 80);
  txt(`${paperLabel}   |   ${examMode ? "Timed Exam" : "Practice Mode"}`, ML, y);
  if (userEmail) txt(userEmail, ML + CW + 4, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 5;

  boldRule();

  // ── Score hero ─────────────────────────────────────────────────────────────
  checkPage(30);
  const heroY = y;
  const heroW = CW + 4;
  doc.setFillColor(243, 246, 252);
  doc.setDrawColor(205, 215, 235);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, heroY, heroW, 26, 3, 3, "FD");

  setF("bold", 24, 15, 25, 80);
  txt(`${totalCorrect} / ${questions.length}`, ML + 5, heroY + 11);
  setF("bold", 11, 50, 60, 100);
  txt(`${pct}%   -   ${grade}`, ML + 5, heroY + 20);

  const sX = ML + heroW * 0.52;
  let sY = heroY + 5;
  [
    ["Correct",  String(totalCorrect), [22, 163, 74]],
    ["Wrong",    String(totalWrong),   [210, 38, 38]],
    ["Guessed",  String(totalGuessed), [217, 119, 6]],
    ["Blank",    String(totalBlank),   [100, 100, 120]],
  ].forEach(([label, val, col]) => {
    setF("normal", 8.5, 90, 90, 90);
    txt(label + ":", sX, sY);
    setF("bold", 8.5, ...col);
    txt(val, sX + 28, sY);
    sY += 5.2;
  });

  doc.setTextColor(0, 0, 0);
  y = heroY + 30;

  // ── Topic Analysis ─────────────────────────────────────────────────────────
  y += 4;
  checkPage(14 + topicsSorted.length * 13);

  setF("bold", 8, 90, 90, 100);
  txt("TOPIC ANALYSIS  (weakest first)", ML, y);
  y += 6;

  const T_LABEL_W = CW * 0.40;
  const T_BAR_X   = ML + T_LABEL_W + 6;
  const T_BAR_W   = CW * 0.42;
  const T_BAR_H   = 3.8;

  topicsSorted.forEach(([topic, { correct, total }]) => {
    const tp      = total > 0 ? correct / total : 0;
    const pctInt  = Math.round(tp * 100);
    const barFill = T_BAR_W * tp;
    const col = pctInt >= 70 ? [34, 197, 94] : pctInt >= 50 ? [251, 146, 60] : [239, 68, 68];

    checkPage(12);

    setF("normal", 8.5, 30, 30, 30);
    const labelLines = doc.splitTextToSize(sanitisePdf(topic), T_LABEL_W);
    doc.text(labelLines[0], ML, y + 3);

    setF("bold", 8.5, ...col);
    txt(`${correct}/${total} (${pctInt}%)`, ML + CW + 4, y + 3, { align: "right" });

    doc.setFillColor(222, 226, 236);
    doc.setDrawColor(205, 210, 224);
    doc.setLineWidth(0.2);
    doc.roundedRect(T_BAR_X, y, T_BAR_W, T_BAR_H, 1.5, 1.5, "FD");

    if (barFill > 1) {
      doc.setFillColor(...col);
      doc.roundedRect(T_BAR_X, y, barFill, T_BAR_H, 1.5, 1.5, "F");
    }

    doc.setTextColor(0, 0, 0);
    y += 11;
  });

  if (weakTopics.length > 0) {
    y += 2;
    checkPage(16);
    const warnLines = wrapLines(weakTopics.slice(0, 5).join("  |  "), CW - 30);
    const warnH = warnLines.length * LH(8) + 12;
    doc.setFillColor(255, 248, 230);
    doc.setDrawColor(245, 185, 60);
    doc.setLineWidth(0.5);
    doc.roundedRect(ML, y, CW + 4, warnH, 2.5, 2.5, "FD");
    setF("bold", 8, 160, 100, 0);
    txt("[!] Topics to focus on:", ML + 4, y + 6);
    setF("normal", 8, 120, 70, 0);
    warnLines.forEach((l, i) => doc.text(l, ML + 4, y + 11 + i * LH(8)));
    doc.setTextColor(0, 0, 0);
    y += warnH + 6;
  }

  boldRule();

  // ── Section heading ────────────────────────────────────────────────────────
  checkPage(12);
  setF("bold", 10, 20, 20, 20);
  txt("Questions to Review", ML, y);
  setF("normal", 8.5, 120, 120, 120);
  txt(
    `${reviewQs.length} question${reviewQs.length !== 1 ? "s" : ""} (wrong + guessed + blank)`,
    ML + 50, y + 0.5
  );
  doc.setTextColor(0, 0, 0);
  y += 7;

  if (reviewQs.length === 0) {
    checkPage(10);
    setF("italic", 10, 80, 80, 80);
    txt("No questions to review - perfect score!", ML, y);
    y += 8;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // REVIEW QUESTION ENTRIES (wrong + guessed + blank)
  // ══════════════════════════════════════════════════════════════════════════
  const OPTS      = ["A", "B", "C", "D"];
  const NUM_RULES = 4;
  const RULE_GAP  = 9;
  const OPT_TEXT_X = ML + 8;
  const OPT_TEXT_W = CW - 10;

  reviewQs.forEach((q, qi) => {
    const a       = answers[q.id];
    const chosen  = a?.chosen ?? null;
    const correct = q.correct;
    const isGuess = a?.flagged_as_guess ?? false;
    const isBlank = !a;
    const layer1  = a?.layer1 ?? null;

    checkPage(60);

    // ── Question header card ──────────────────────────────────────────────
    const CARD_H = 14;
    doc.setFillColor(233, 241, 255);
    doc.setDrawColor(175, 200, 235);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, CW + 4, CARD_H, 2.5, 2.5, "FD");

    setF("bold", 9, 20, 55, 130);
    txt(`Q${q.number}`, ML + 4, y + 9);

    setF("normal", 8, 55, 75, 130);
    const topicLines = doc.splitTextToSize(sanitisePdf(q.topic ?? ""), CW - 50);
    doc.text(topicLines[0], ML + 18, y + 9);

    // Status pill
    const pillLabel = isBlank ? "BLANK" : isGuess ? "GUESSED" : "WRONG";
    const pillW     = isBlank ? 19 : isGuess ? 23 : 19;
    const pillH     = 6;
    const pillX     = ML + CW + 4 - pillW - 4;
    const pillY     = y + (CARD_H - pillH) / 2;
    const pillFg    = isBlank ? [80, 80, 110]  : isGuess ? [200, 110, 0] : [195, 30, 30];
    const pillBg    = isBlank ? [225, 225, 240] : isGuess ? [255, 240, 210] : [255, 230, 230];
    doc.setFillColor(...pillBg);
    doc.setDrawColor(...pillFg);
    doc.setLineWidth(0.5);
    doc.roundedRect(pillX, pillY, pillW, pillH, 1.5, 1.5, "FD");
    setF("bold", 7, ...pillFg);
    txt(pillLabel, pillX + pillW / 2, pillY + pillH * 0.67, { align: "center" });

    doc.setTextColor(0, 0, 0);
    y += CARD_H + 4;

    // ── Question text ─────────────────────────────────────────────────────
    const qLines = wrapLines(q.text, CW);
    checkPage(qLines.length * LH(9.5) + 6);
    setF("normal", 9.5, 20, 20, 20);
    qLines.forEach(line => { doc.text(line, ML, y); y += LH(9.5); });
    y += 4;

    // ── Options ───────────────────────────────────────────────────────────
    OPTS.forEach(k => {
      const optRaw = q.options?.[k];
      if (!optRaw) return;

      const isCorrectOpt  = k === correct;
      const isChosenWrong = !isBlank && k === chosen && !isCorrectOpt;

      let bgR = 248, bgG = 248, bgB = 248;
      let brR = 210, brG = 210, brB = 210;
      let txtR = 65,  txtG = 65,  txtB = 65;

      if (isCorrectOpt) {
        bgR = 228; bgG = 250; bgB = 234;
        brR = 90;  brG = 195; brB = 120;
        txtR = 15; txtG = 100; txtB = 40;
      } else if (isChosenWrong) {
        bgR = 255; bgG = 232; bgB = 232;
        brR = 215; brG = 110; brB = 110;
        txtR = 170; txtG = 25; txtB = 25;
      }

      const optText  = `${k}.  ${sanitisePdf(optRaw)}`;
      const optLines = doc.splitTextToSize(optText, OPT_TEXT_W);
      const optH     = Math.max(9, optLines.length * LH(9) + 5);

      checkPage(optH + 2.5);

      doc.setFillColor(bgR, bgG, bgB);
      doc.setDrawColor(brR, brG, brB);
      doc.setLineWidth(0.35);
      doc.roundedRect(ML, y, CW + 4, optH, 1.8, 1.8, "FD");

      // Left accent bar
      if (isCorrectOpt) {
        doc.setFillColor(90, 195, 120);
        doc.roundedRect(ML, y, 3, optH, 1, 1, "F");
      } else if (isChosenWrong) {
        doc.setFillColor(215, 110, 110);
        doc.roundedRect(ML, y, 3, optH, 1, 1, "F");
      }

      setF(isCorrectOpt ? "bold" : "normal", 9, txtR, txtG, txtB);
      optLines.forEach((line, li) => doc.text(line, OPT_TEXT_X, y + 5.5 + li * LH(9)));

      // Badge tag
      if (isCorrectOpt || isChosenWrong) {
        const tagLabel = isCorrectOpt ? "CORRECT" : "YOUR ANSWER";
        const tagW = isCorrectOpt ? 22 : 30;
        const tagH = 5.5;
        const tagX = ML + CW + 4 - tagW - 3;
        const tagY = y + (optH - tagH) / 2;
        doc.setFillColor(isCorrectOpt ? 90 : 215, isCorrectOpt ? 195 : 110, isCorrectOpt ? 120 : 110);
        doc.roundedRect(tagX, tagY, tagW, tagH, 1.2, 1.2, "F");
        setF("bold", 6.5, 255, 255, 255);
        txt(tagLabel, tagX + tagW / 2, tagY + tagH * 0.7, { align: "center" });
      }

      doc.setTextColor(0, 0, 0);
      y += optH + 2.5;
    });

    y += 2;

    // ── For blank questions: show a "You left this blank" notice ──────────
    if (isBlank) {
      checkPage(10);
      doc.setFillColor(230, 230, 245);
      doc.setDrawColor(160, 160, 190);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW + 4, 9, 1.5, 1.5, "FD");
      setF("italic", 8.5, 80, 80, 120);
      txt("You left this question blank — the correct answer is highlighted above.", ML + 4, y + 5.8);
      doc.setTextColor(0, 0, 0);
      y += 13;
    }

    // ── AI Feedback (only present if question was submitted) ──────────────
    if (layer1?.pulse_layer_1) {
      const tkLines = wrapLines(layer1.pulse_layer_1, CW - 4);
      const tkH = tkLines.length * LH(9) + 13;
      checkPage(tkH + 4);
      doc.setFillColor(232, 250, 240);
      doc.setDrawColor(95, 190, 120);
      doc.setLineWidth(0.4);
      doc.roundedRect(ML, y, CW + 4, tkH, 2, 2, "FD");
      setF("bold", 7.5, 20, 110, 55);
      txt("KEY EXAM TAKEAWAY", ML + 5, y + 6);
      setF("bold", 9, 10, 80, 40);
      tkLines.forEach((line, li) => doc.text(line, ML + 5, y + 11 + li * LH(9)));
      doc.setTextColor(0, 0, 0);
      y += tkH + 3;
    }

    if (layer1?.cambridge_insight) {
      const ciLines = wrapLines(layer1.cambridge_insight, CW - 4);
      const ciH = ciLines.length * LH(9) + 13;
      checkPage(ciH + 4);
      doc.setFillColor(244, 246, 254);
      doc.setDrawColor(185, 195, 230);
      doc.setLineWidth(0.35);
      doc.roundedRect(ML, y, CW + 4, ciH, 2, 2, "FD");
      setF("bold", 7.5, 80, 85, 130);
      txt("CAMBRIDGE INSIGHT", ML + 5, y + 6);
      setF("normal", 9, 40, 45, 90);
      ciLines.forEach((line, li) => doc.text(line, ML + 5, y + 11 + li * LH(9)));
      doc.setTextColor(0, 0, 0);
      y += ciH + 3;
    }

    y += 3;

    // ── Reflection boxes ──────────────────────────────────────────────────
    ["What I Thought Was True", "What I Now Understand"].forEach((heading, ri) => {
      const boxH = NUM_RULES * RULE_GAP + 17;
      checkPage(boxH + 5);
      doc.setFillColor(252, 252, 250);
      doc.setDrawColor(198, 196, 190);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW + 4, boxH, 2, 2, "FD");
      setF("bold", 8.5, 30, 30, 30);
      txt(heading, ML + 5, y + 8);
      setF("italic", 7.5, 155, 155, 155);
      txt("(fill in by hand)", ML + CW, y + 8, { align: "right" });
      doc.setDrawColor(175, 172, 162);
      doc.setLineWidth(0.22);
      for (let i = 0; i < NUM_RULES; i++) {
        doc.line(ML + 5, y + 14 + i * RULE_GAP, ML + CW - 1, y + 14 + i * RULE_GAP);
      }
      doc.setTextColor(0, 0, 0);
      y += boxH + (ri === 0 ? 4 : 9);
    });

    // ── Divider between questions ─────────────────────────────────────────
    if (qi < reviewQs.length - 1) {
      checkPage(8);
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(ML, y, ML + CW + 4, y);
      y += 8;
      doc.setDrawColor(0, 0, 0);
    }
  });

  footer();

  const safeName = (paperLabel ?? paperId ?? "review")
    .replace(/[^\w]/g, "_").replace(/_+/g, "_").slice(0, 40);
  const filename = `MCQ_Review_${safeName}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}