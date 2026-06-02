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

function extractMarkPoints(feedback) {
  if (!feedback) return [];
  if (Array.isArray(feedback.pulse_layer_2_marks) && feedback.pulse_layer_2_marks.length > 0) {
    return feedback.pulse_layer_2_marks.map(m => ({
      notation: m.notation ?? "B1",
      keyword: m.description ?? m.keyword ?? "",
      earned: !!m.earned,
      note: m.examiner_note ?? m.feedback ?? "",
    }));
  }
  if (Array.isArray(feedback.mark_breakdown) && feedback.mark_breakdown.length > 0) {
    return feedback.mark_breakdown.map((m, i) => ({
      notation: `B${i + 1}`,
      keyword: m.point ?? "",
      earned: !!m.awarded,
      note: m.comment ?? "",
    }));
  }
  return Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([, val], i) => ({
      notation: val.notation ?? `B${i + 1}`,
      keyword: val.keyword ?? "",
      earned: !!val.earned,
      note: val.feedback ?? "",
    }));
}

/**
 * generateQuestionReviewPdf
 *
 * @param question   { text, topic, total_marks, paper_ref, label, options?, correct? }
 * @param answer     string (student's answer or chosen MCQ option letter)
 * @param feedback   AI feedback object (any format)
 * @param layer2     optional { step1_system, step2_phrase_breakdown, step3_tipping_point }
 * @param subject    "physics" | "cs"
 * @param userEmail  optional
 */
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
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  // ── Layout constants ──────────────────────────────────────────────────────
  const PW = 210, PH = 297;
  const ML = 18, MR = 18, MT = 20, MB = 22;
  const CW = PW - ML - MR; // 174mm
  const SAFE_Y = PH - MB;  // 275mm

  let y = MT;
  let pageNum = 1;

  // ── Extract question fields ───────────────────────────────────────────────
  const isMultipleChoice = !!(question?.options);
  const qText    = String(question?.text ?? question?.question_text ?? "");
  const qTopic   = String(question?.topic ?? "");
  const qMarks   = question?.total_marks ?? 1;
  const qRef     = String(question?.paper_ref ?? question?.source ?? "");
  const qLabel   = String(question?.label ?? (question?.number ? `Q${question.number}` : ""));

  // ── Extract feedback fields ───────────────────────────────────────────────
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks   = marksEarned >= qMarks;
  const takeaway    = feedback?.pulse_layer_1 ?? null;
  const insight     = feedback?.cambridge_insight ?? null;
  const markPoints  = extractMarkPoints(feedback);

  // deeper analysis — check layer2 first, then embedded in feedback
  const step1 = layer2?.step1_system       ?? feedback?.step1_system       ?? null;
  const step2 = layer2?.step2_phrase_breakdown ?? feedback?.step2_phrase_breakdown ?? null;
  const step3 = layer2?.step3_tipping_point ?? feedback?.step3_tipping_point ?? null;
  const hasDeeper = step1 || step2 || step3;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

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
    if (userEmail) doc.text(userEmail, PW / 2, PH - 11, { align: "center" });
    doc.text(`Page ${pageNum}`, PW - MR, PH - 11, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  function drawWrapped(text, x, fontSize, fontStyle, colorArr, maxW) {
    if (!text) return;
    doc.setFont("helvetica", fontStyle ?? "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...colorArr);
    const lh = LH(fontSize);
    const lines = doc.splitTextToSize(String(text), maxW);
    for (const line of lines) {
      checkPage(lh + 1);
      doc.text(line, x, y);
      y += lh;
    }
    doc.setTextColor(0, 0, 0);
  }

  function gap(mm)  { y += mm; }

  function rule(alpha = 210) {
    checkPage(3);
    doc.setDrawColor(alpha, alpha, alpha);
    doc.setLineWidth(0.25);
    doc.line(ML, y, PW - MR, y);
    y += 3.5;
    doc.setDrawColor(0, 0, 0);
  }

  function sectionLabel(text, r = 100, g = 100, b = 100) {
    checkPage(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(r, g, b);
    doc.text(text.toUpperCase(), ML, y);
    doc.setTextColor(0, 0, 0);
    y += 4.5;
  }

  // ── HEADER ────────────────────────────────────────────────────────────────

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

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const subjectLabel = subject === "cs" ? "Computer Science (9618)" : "Physics (9702)";
  const metaParts = [subjectLabel, qRef].filter(Boolean);
  doc.text(metaParts.join("  ·  "), ML, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  // Bold top rule
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.7);
  doc.line(ML, y, PW - MR, y);
  y += 5.5;
  doc.setDrawColor(0, 0, 0);

  // ── QUESTION ──────────────────────────────────────────────────────────────

  sectionLabel("Question");

  // Label + marks on same line
  if (qLabel || qMarks) {
    checkPage(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    if (qLabel) doc.text(qLabel, ML, y);
    if (qTopic) {
      const topicX = qLabel ? ML + 28 : ML;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 110);
      doc.text(qTopic, topicX, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text(`[${qMarks} mark${qMarks !== 1 ? "s" : ""}]`, PW - MR, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 5.5;
  }

  // Question text
  drawWrapped(qText, ML, 10.5, "normal", [20, 20, 20], CW);

  // MCQ options
  if (isMultipleChoice && question?.options) {
    gap(2.5);
    const optKeys = ["A", "B", "C", "D"];
    for (const k of optKeys) {
      const optText = question.options[k];
      if (!optText) continue;

      const isCorrect = k === question.correct;
      const isChosen  = k === answer;
      const color = isCorrect
        ? [22, 163, 74]
        : (isChosen && !isCorrect ? [220, 38, 38] : [90, 90, 90]);
      const fStyle = isCorrect ? "bold" : "normal";
      const prefix = isCorrect ? "✓" : (isChosen && !isCorrect ? "✗" : "·");

      doc.setFont("helvetica", fStyle);
      doc.setFontSize(9.5);
      doc.setTextColor(...color);

      const fullLine = `${prefix}  ${k}.  ${optText}`;
      const lh = LH(9.5);
      const lines = doc.splitTextToSize(fullLine, CW - 4);
      checkPage(lines.length * lh + 1);
      lines.forEach((line, i) => {
        doc.text(i === 0 ? ML : ML + 10, y, line);
        y += lh;
      });
      doc.setTextColor(0, 0, 0);
      y += 0.5;
    }
  }

  gap(4);
  rule();

  // ── YOUR ANSWER ───────────────────────────────────────────────────────────

  sectionLabel("Your Answer");

  if (!answer?.trim()) {
    checkPage(6);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(150, 150, 150);
    doc.text("(No answer submitted)", ML, y);
    y += 5.5;
    doc.setTextColor(0, 0, 0);
  } else {
    drawWrapped(answer, ML, 10, "normal", [30, 30, 30], CW);
  }

  gap(4);
  rule();

  // ── AI FEEDBACK ───────────────────────────────────────────────────────────

  checkPage(9);

  // Score heading row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("AI FEEDBACK", ML, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const scoreR = fullMarks ? 22  : 200;
  const scoreG = fullMarks ? 163 : 60;
  const scoreB = fullMarks ? 74  : 60;
  doc.setTextColor(scoreR, scoreG, scoreB);
  doc.text(`${marksEarned} / ${qMarks} marks`, PW - MR, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 6;

  // Key Takeaway
  if (takeaway) {
    checkPage(13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 110, 60);
    doc.text("Key Takeaway", ML, y);
    y += 5;
    drawWrapped(takeaway, ML + 2, 10, "bold", [20, 70, 40], CW - 2);
    gap(4);
  }

  // Mark breakdown
  if (markPoints.length > 0) {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text("Mark Breakdown", ML, y);
    y += 5;

    for (const mp of markPoints) {
      const colArr = mp.earned ? [22, 163, 74] : [210, 38, 38];
      const lh9 = LH(9.5);
      const lh8 = LH(8.5);

      checkPage(lh9 * 2 + 6);

      // Check mark + notation
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...colArr);
      doc.text(`${mp.earned ? "✓" : "✗"}  ${mp.notation}`, ML, y);

      // Keyword on same row (right side indent)
      doc.setFont("helvetica", mp.earned ? "bold" : "normal");
      doc.setTextColor(30, 30, 30);
      const kwLines = doc.splitTextToSize(mp.keyword || "", CW - 20);
      kwLines.forEach((line, i) => {
        checkPage(lh9);
        doc.text(ML + 18, y + i * lh9, line);
      });
      y += kwLines.length * lh9;
      doc.setTextColor(0, 0, 0);

      // Examiner note
      if (mp.note) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(120, 120, 120);
        const nLines = doc.splitTextToSize(mp.note, CW - 18);
        nLines.forEach(line => {
          checkPage(lh8);
          doc.text(ML + 18, y, line);
          y += lh8;
        });
        doc.setTextColor(0, 0, 0);
      }

      y += 3;
    }

    gap(2);
  }

  // Cambridge Insight
  if (insight) {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text("Cambridge Insight", ML, y);
    y += 5;
    drawWrapped(insight, ML + 2, 9.5, "normal", [50, 50, 50], CW - 2);
    gap(4);
  }

  // Deeper Analysis
  if (hasDeeper) {
    checkPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 130);
    doc.text("Deeper Analysis", ML, y);
    y += 5;

    [
      { n: "1", label: "What is being tested", content: step1 },
      { n: "2", label: "Key phrases to look for", content: step2 },
      { n: "3", label: "The deciding factor", content: step3 },
    ]
      .filter(s => s.content)
      .forEach(s => {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(55, 55, 110);
        doc.text(`${s.n}.  ${s.label}`, ML + 2, y);
        y += 5;
        drawWrapped(s.content, ML + 6, 9.5, "normal", [50, 50, 50], CW - 6);
        gap(3);
      });

    gap(1);
  }

  gap(4);

  // Bold divider before reflection
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.6);
  doc.line(ML, y, PW - MR, y);
  y += 6;
  doc.setDrawColor(0, 0, 0);

  // ── REFLECTION SECTIONS ───────────────────────────────────────────────────

  const NUM_RULED    = 5;
  const RULED_GAP    = 9;   // mm between ruled lines
  const reflectH     = NUM_RULED * RULED_GAP;

  function drawReflectSection(heading) {
    checkPage(reflectH + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(25, 25, 25);
    doc.text(heading, ML, y);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(155, 155, 155);
    doc.text("(fill in by hand)", PW - MR, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 7;

    doc.setDrawColor(185, 185, 185);
    doc.setLineWidth(0.25);
    for (let i = 0; i < NUM_RULED; i++) {
      doc.line(ML, y + i * RULED_GAP, PW - MR, y + i * RULED_GAP);
    }
    y += (NUM_RULED - 1) * RULED_GAP + 2;
  }

  drawReflectSection("What I Thought Was True");
  gap(11);
  drawReflectSection("What I Now Understand (from the AI Feedback)");

  // Footer on last page
  drawFooter();

  // ── Save ──────────────────────────────────────────────────────────────────

  const safeId = [qTopic, qLabel]
    .filter(Boolean)
    .join("_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);

  const filename = `QuestionReview_${safeId || "review"}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); }
  catch { window.open(doc.output("bloburl"), "_blank"); }
}