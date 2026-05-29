/**
 * p1StarPdf.js — generates a printable PDF of starred questions + AI feedback.
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
  const margin = 15;
  const contentW = pageW - margin * 2;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let pageNum = 1;
  let y = 0;

  function newPage() {
    doc.addPage();
    pageNum++;
    y = 20;
    drawPageHeader();
  }

  function checkSpace(needed) {
    if (y + needed > pageH - 18) newPage();
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  function drawPageHeader() {
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont("helvetica", "normal");
    doc.text(`Cambridge Hub — Starred Questions Report`, margin, 10);
    doc.text(`Paper: ${paperLabel ?? paperId}`, margin, 14);
    doc.text(`Date: ${dateStr}`, pageW - margin - 30, 14);
    doc.text(`Page ${pageNum}`, pageW - margin - 12, 10);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 17, pageW - margin, 17);
    doc.setTextColor(30, 30, 30);
    y = 22;
  }

  // ── Cover page ────────────────────────────────────────────────────────────
  drawPageHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text("⭐ Starred Questions for Teacher Review", margin, y); y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Paper: ${paperLabel ?? paperId}`, margin, y); y += 6;
  if (userEmail) { doc.text(`Student: ${userEmail}`, margin, y); y += 6; }
  doc.text(`Questions starred: ${Object.keys(starredQuestions).length}`, margin, y); y += 6;
  doc.text(`Generated: ${dateStr}`, margin, y); y += 6;
  y += 4;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const introLines = wrap(
    "The following questions were starred by the student for further clarification. " +
    "Each question includes the AI-generated feedback that was shown to the student, " +
    "including the exam takeaway, Cambridge insight, and deeper breakdown.",
    contentW
  );
  introLines.forEach(line => { doc.text(line, margin, y); y += 5; });
  y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y); y += 8;

  // ── Per-question sections ─────────────────────────────────────────────────
  const entries = Object.values(starredQuestions).sort((a, b) => a.questionNumber - b.questionNumber);

  entries.forEach((entry, ei) => {
    checkSpace(30);

    // Question header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`⭐ Question ${entry.questionNumber}`, margin, y); y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Topic: ${entry.topic ?? ""}`, margin, y); y += 5;

    // Question text
    checkSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Question:", margin, y); y += 5;
    doc.setFont("helvetica", "normal");
    const qLines = wrap(entry.questionText ?? "", contentW);
    qLines.forEach(line => { checkSpace(5); doc.text(line, margin, y); y += 5; });
    y += 2;

    // Options
    if (entry.options) {
      checkSpace(8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Options:", margin, y); y += 5;
      doc.setFont("helvetica", "normal");
      ["A", "B", "C", "D"].forEach(k => {
        const isCorrect = k === entry.correctAnswer;
        const optLines = wrap(`${k}: ${entry.options[k] ?? ""}`, contentW - 8);
        checkSpace(optLines.length * 4.5 + 2);
        if (isCorrect) {
          doc.setTextColor(34, 139, 34);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "normal");
        }
        optLines.forEach(line => { doc.text(line, margin + 4, y); y += 4.5; });
      });
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "normal");
      y += 2;
    }

    // Correct answer
    checkSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(34, 139, 34);
    doc.text(`Correct Answer: ${entry.correctAnswer}`, margin, y); y += 6;
    doc.setTextColor(30, 30, 30);

    // AI Feedback sections
    const fb = entry.feedback;
    if (fb) {
      const sections = [
        { title: "📌 Exam Takeaway", content: fb.pulse_layer_1, color: [22, 163, 74] },
        { title: "Cambridge Insight", content: fb.cambridge_insight, color: [30, 30, 30] },
        { title: "Step 1 — The System & Objective", content: fb.step1_system, color: [37, 99, 235] },
        { title: "Step 2 — Phrase-by-Phrase Breakdown", content: fb.step2_phrase_breakdown, color: [124, 58, 237] },
        { title: "Step 3 — The Tipping Point", content: fb.step3_tipping_point, color: [217, 119, 6] },
      ].filter(s => s.content);

      sections.forEach(s => {
        checkSpace(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(s.color[0], s.color[1], s.color[2]);
        doc.text(s.title, margin, y); y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        const lines = wrap(s.content, contentW);
        lines.forEach(line => { checkSpace(5); doc.text(line, margin + 3, y); y += 4.5; });
        y += 3;
      });

      // Student's result
      if (fb.marks_earned !== undefined) {
        checkSpace(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const gotIt = fb.marks_earned > 0;
        doc.setTextColor(gotIt ? 34 : 180, gotIt ? 139 : 50, gotIt ? 34 : 50);
        doc.text(`Student got this: ${gotIt ? "✓ Correct" : "✗ Incorrect"}`, margin, y); y += 6;
        doc.setTextColor(30, 30, 30);
      }
    }

    // Divider between questions
    checkSpace(8);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y); y += 8;
  });

  // Footer note
  checkSpace(12);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by Cambridge Hub — cambridgehub.base44.app", margin, y);

  const safeLabel = (paperLabel ?? paperId).replace(/[\/\s]/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `Starred_Questions_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try {
    doc.save(filename);
  } catch {
    window.open(doc.output("bloburl"), "_blank");
  }
}