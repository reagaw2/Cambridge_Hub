/**
 * p1StarPdf.js — Teacher Review PDF for starred questions.
 * Clean section headings, generous spacing, teacher question bold+italic at bottom.
 */

const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

async function loadJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = JSPDF_CDN;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.jspdf.jsPDF;
}

export async function generateStarredPdf({ paperId, paperLabel, starredQuestions, userEmail }) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let pageNum = 1;
  let y = 0;

  function newPage() {
    doc.addPage();
    pageNum++;
    y = margin;
    drawFooter();
  }

  function checkSpace(needed) {
    if (y + needed > pageH - 24) newPage();
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  function drawFooter() {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text("Cambridge Hub — Starred Questions for Teacher Review", margin, pageH - 10);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: "right" });
    doc.setTextColor(30, 30, 30);
  }

  // ── Cover page ─────────────────────────────────────────────────────────────
  y = 32;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 20);
  doc.text("Starred Questions", margin, y); y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text("For Teacher Review", margin, y); y += 10;

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y); y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  if (paperLabel ?? paperId) { doc.text(`Paper: ${paperLabel ?? paperId}`, margin, y); y += 7; }
  if (userEmail) { doc.text(`Student: ${userEmail}`, margin, y); y += 7; }
  doc.text(`Generated: ${dateStr}`, margin, y); y += 7;

  const entries = Object.values(starredQuestions).sort((a, b) => a.questionNumber - b.questionNumber);
  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`${entries.length} question${entries.length !== 1 ? "s" : ""} starred for teacher consultation`, margin, y);
  y += 14;

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y); y += 14;

  drawFooter();

  // ── Per-question entries ───────────────────────────────────────────────────
  entries.forEach((entry, ei) => {
    // Force each question to start with enough room for the header
    checkSpace(50);

    // ── Question header ─────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 20);
    doc.text(`Question ${entry.questionNumber}`, margin, y); y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(entry.topic ?? "", margin, y); y += 10;

    // ── Question text ───────────────────────────────────────────────────────
    const qLines = wrap(entry.questionText ?? "", contentW);
    checkSpace(qLines.length * 5.5 + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    qLines.forEach(line => { checkSpace(6); doc.text(line, margin, y); y += 5.5; });
    y += 6;

    // ── Options ─────────────────────────────────────────────────────────────
    if (entry.options) {
      checkSpace(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Options", margin, y); y += 6;

      ["A", "B", "C", "D"].forEach(k => {
        const isCorrect = k === entry.correctAnswer;
        const optLines = wrap(`${k}.  ${entry.options[k] ?? ""}`, contentW - 4);
        checkSpace(optLines.length * 5 + 2);
        if (isCorrect) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(22, 120, 60);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(70, 70, 70);
        }
        doc.setFontSize(10);
        optLines.forEach(line => { doc.text(line, margin + 3, y); y += 5; });
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(22, 120, 60);
      y += 3;
      doc.text(`Correct answer: ${entry.correctAnswer}`, margin, y); y += 10;
      doc.setTextColor(30, 30, 30);
    }

    // ── AI Feedback ─────────────────────────────────────────────────────────
    const fb = entry.feedback;
    if (fb) {
      const sections = [
        { title: "Exam Takeaway", content: fb.pulse_layer_1, r: 22, g: 120, b: 60 },
        { title: "Cambridge Insight", content: fb.cambridge_insight, r: 37, g: 99, b: 200 },
        { title: "Step 1 — System & Objective", content: fb.step1_system, r: 60, g: 60, b: 60 },
        { title: "Step 2 — Phrase Breakdown", content: fb.step2_phrase_breakdown, r: 60, g: 60, b: 60 },
        { title: "Step 3 — The Tipping Point", content: fb.step3_tipping_point, r: 60, g: 60, b: 60 },
      ].filter(s => s.content);

      if (sections.length > 0) {
        checkSpace(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text("AI Feedback", margin, y); y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y + 1, pageW - margin, y + 1); y += 7;

        sections.forEach(s => {
          const lines = wrap(s.content, contentW - 4);
          checkSpace(lines.length * 5 + 10);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(s.r, s.g, s.b);
          doc.text(s.title, margin, y); y += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(40, 40, 40);
          lines.forEach(line => { checkSpace(6); doc.text(line, margin + 3, y); y += 5.2; });
          y += 5;
        });
      }
    }

    // ── Teacher's question — bold + italic, at the bottom of this entry ─────
    if (entry.teacherQuestion?.trim()) {
      const tqLines = wrap(entry.teacherQuestion, contentW - 8);
      const tqBlockH = tqLines.length * 5.5 + 14;
      checkSpace(tqBlockH + 4);

      y += 2;
      doc.setFillColor(255, 252, 235);
      doc.setDrawColor(200, 160, 20);
      doc.setLineWidth(0.6);
      doc.roundedRect(margin, y, contentW, tqBlockH, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(140, 100, 0);
      doc.text("Question for Teacher", margin + 5, y + 6);

      // The actual question — bold italic
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(10);
      doc.setTextColor(80, 55, 0);
      tqLines.forEach((line, li) => {
        doc.text(line, margin + 5, y + 11 + li * 5.5);
      });
      y += tqBlockH + 6;
    }

    // ── Divider between questions ───────────────────────────────────────────
    if (ei < entries.length - 1) {
      checkSpace(10);
      y += 4;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageW - margin, y);
      y += 16;
    }
  });

  drawFooter();

  const safeLabel = (paperLabel ?? paperId ?? "review").replace(/[\/\s]/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `TeacherReview_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}