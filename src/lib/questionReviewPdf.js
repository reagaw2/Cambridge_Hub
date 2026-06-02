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

export async function generateQuestionReviewPdf({
  question = {},
  answer = "",
  feedback = null,
  layer2 = null,
  subject = "physics",
  userEmail = "",
}) {
  if (!feedback) return;

  const JsPDF = await loadJsPDF();

  const PW = 210, PH = 297;
  const ML = 18, MR = 18, MT = 20, MB = 22;
  const CW = PW - ML - MR - 4;
  const SAFE_Y = PH - MB;

  const doc = new JsPDF({ unit: "mm", format: "a4" });
  let y = MT;
  let pageNum = 1;

  const isMultipleChoice = !!(question?.options);
  const qText    = String(question?.text ?? question?.question_text ?? "");
  const qTopic   = String(question?.topic ?? "");
  const qMarks   = question?.total_marks ?? 1;
  const qRef     = String(question?.paper_ref ?? question?.source ?? "");
  const qLabel   = String(question?.label ?? (question?.number ? `Q${question.number}` : ""));

  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks   = marksEarned >= qMarks;
  const takeaway    = feedback?.pulse_layer_1 ?? null;
  const insight     = feedback?.cambridge_insight ?? null;

  const step1 = layer2?.step1_system       ?? feedback?.step1_system       ?? null;
  const step2 = layer2?.step2_phrase_breakdown ?? feedback?.step2_phrase_breakdown ?? null;
  const step3 = layer2?.step3_tipping_point ?? feedback?.step3_tipping_point ?? null;
  const hasDeeper = step1 || step2 || step3;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const LH = (fontSize) => (fontSize / 72) * 25.4 * 1.55;

  function checkPage(needed) {
    if (y + needed > SAFE_Y) {
      drawFooter();
      doc.addPage();
      pageNum++;
      y = MT;
    }
  }

  function drawFooter() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text("Cambridge Hub — Question Review", ML, PH - 11);
    if (userEmail) doc.text(sanitisePdf(userEmail), PW / 2, PH - 11, { align: "center" });
    doc.text(`Page ${pageNum}`, PW - MR, PH - 11, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  function drawWrapped(text, x, fontSize, fontStyle, colorArr, maxW) {
    if (!text) return;
    doc.setFont("helvetica", fontStyle ?? "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...colorArr);
    const lh = LH(fontSize);
    const lines = doc.splitTextToSize(sanitisePdf(text), maxW);
    for (const line of lines) {
      checkPage(lh + 1);
      doc.text(line, x, y);
      y += lh;
    }
    doc.setTextColor(0, 0, 0);
  }

  function gap(mm) { y += mm; }

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Cambridge Hub", ML, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(110, 110, 110);
  doc.text("Question Review", ML + 48, y + 0.3);
  doc.setFontSize(8.5);
  doc.text(dateStr, PW - MR, y, { align: "right" });
  y += 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const subjectLabel = subject === "cs" ? "Computer Science (9618)" : "Physics (9702)";
  const metaParts = [subjectLabel, qRef].filter(Boolean);
  doc.text(sanitisePdf(metaParts.join("  ·  ")), ML, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.7);
  doc.line(ML, y, PW - MR, y);
  y += 5.5;
  doc.setDrawColor(0, 0, 0);

  // ── Question ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  doc.text("QUESTION", ML, y);
  y += 4.5;

  if (qLabel || qMarks) {
    checkPage(6);
    if (qLabel) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      doc.text(sanitisePdf(qLabel), ML, y);
    }
    if (qTopic) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 110);
      doc.text(sanitisePdf(qTopic), ML + 28, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`[${qMarks} mark${qMarks !== 1 ? "s" : ""}]`, PW - MR, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 5.5;
  }

  drawWrapped(qText, ML, 10.5, "normal", [20, 20, 20], CW);

  if (isMultipleChoice && question?.options) {
    gap(2.5);
    const optKeys = ["A", "B", "C", "D"];
    for (const k of optKeys) {
      const optText = question.options[k];
      if (!optText) continue;
      const isCorrect = k === question.correct;
      const isChosen  = k === answer;
      const color = isCorrect ? [22, 163, 74] : (isChosen && !isCorrect ? [220, 38, 38] : [90, 90, 90]);
      doc.setFont("helvetica", isCorrect ? "bold" : "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...color);
      const fullLine = `${isCorrect ? "+" : (isChosen && !isCorrect ? "-" : "o")}  ${k}.  ${sanitisePdf(optText)}`;
      const lh = LH(9.5);
      const lines = doc.splitTextToSize(fullLine, CW - 4);
      checkPage(lines.length * lh + 1);
      lines.forEach((line, i) => { doc.text(ML, y, line); y += lh; });
      doc.setTextColor(0, 0, 0);
      y += 0.5;
    }
  }

  gap(4);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.25);
  doc.line(ML, y, PW - MR, y);
  doc.setDrawColor(0, 0, 0);
  y += 5;

  // ── Your Answer ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
  doc.text("YOUR ANSWER", ML, y);
  y += 4.5;

  if (!answer?.trim()) {
    checkPage(6);
    doc.setFont("helvetica", "italic"); doc.setFontSize(9.5); doc.setTextColor(150, 150, 150);
    doc.text("(No answer submitted)", ML, y);
    y += 5.5;
    doc.setTextColor(0, 0, 0);
  } else {
    drawWrapped(answer, ML, 10, "normal", [30, 30, 30], CW);
  }

  gap(4);
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.25);
  doc.line(ML, y, PW - MR, y);
  doc.setDrawColor(0); y += 5;

  // ── Feedback ─────────────────────────────────────────────────────────────
  checkPage(9);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
  doc.text("AI FEEDBACK", ML, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.setTextColor(fullMarks ? 22 : 200, fullMarks ? 163 : 60, fullMarks ? 74 : 60);
  doc.text(`${marksEarned} / ${qMarks} marks`, PW - MR, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 6;

  if (takeaway) {
    checkPage(13);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(30, 110, 60);
    doc.text("Key Takeaway", ML, y); y += 5;
    drawWrapped(takeaway, ML + 2, 10, "bold", [20, 70, 40], CW - 2);
    gap(4);
  }

  if (insight) {
    checkPage(10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80);
    doc.text("Cambridge Insight", ML, y); y += 5;
    drawWrapped(insight, ML + 2, 9.5, "normal", [50, 50, 50], CW - 2);
    gap(4);
  }

  if (hasDeeper) {
    checkPage(12);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(70, 70, 130);
    doc.text("Deeper Analysis", ML, y); y += 5;
    [
      { label: "1. What is being tested", content: step1 },
      { label: "2. Key phrases",          content: step2 },
      { label: "3. Deciding factor",      content: step3 },
    ].filter(s => s.content).forEach(s => {
      checkPage(10);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(55, 55, 110);
      doc.text(s.label, ML + 2, y); y += 5;
      drawWrapped(s.content, ML + 6, 9.5, "normal", [50, 50, 50], CW - 6);
      gap(3);
    });
    gap(1);
  }

  gap(4);
  doc.setDrawColor(30, 30, 30); doc.setLineWidth(0.6);
  doc.line(ML, y, PW - MR, y); y += 6;
  doc.setDrawColor(0);

  // ── Reflection sections ─────────────────────────────────────────────────
  const NUM_RULED = 5; const RULED_GAP = 8;

  function drawReflectSection(heading) {
    checkPage(NUM_RULED * RULED_GAP + 22);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(25, 25, 25);
    doc.text(heading, ML, y);
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(155, 155, 155);
    doc.text("(fill in by hand)", PW - MR, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 7;
    doc.setDrawColor(185, 185, 185); doc.setLineWidth(0.3);
    for (let i = 0; i < NUM_RULED; i++) {
      doc.line(ML, y + i * RULED_GAP, PW - MR, y + i * RULED_GAP);
    }
    y += (NUM_RULED - 1) * RULED_GAP + 2;
  }

  drawReflectSection("What I Thought Was True");
  gap(11);
  drawReflectSection("What I Now Understand (from the AI Feedback)");

  drawFooter();

  const safeId = [qTopic, qLabel].filter(Boolean).join("_")
    .replace(/[^\w]/g, "_").replace(/_+/g, "_").slice(0, 40);
  const filename = `QuestionReview_${safeId || "review"}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); }
  catch { window.open(doc.output("bloburl"), "_blank"); }
}