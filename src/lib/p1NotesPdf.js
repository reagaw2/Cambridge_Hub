/**
 * p1NotesPdf.js — generates a printable "My Notes" PDF.
 * Includes: paper info, all questions where the student wrote notes,
 * plus any starred questions with teacher questions appended.
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

export async function generateNotesPdf({ paperId, paperLabel, session, variant, notes, starredQuestions, questions, userEmail }) {
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
    drawHeader();
  }

  function checkSpace(needed) {
    if (y + needed > pageH - 18) newPage();
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  function drawHeader() {
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont("helvetica", "normal");
    doc.text(`Cambridge Hub — My Notes`, margin, 10);
    doc.text(`${paperLabel ?? paperId}  ·  Variant ${variant ?? ""}  ·  ${session ?? ""}`, margin, 14);
    doc.text(`Page ${pageNum}`, pageW - margin - 12, 10);
    doc.text(dateStr, pageW - margin - 30, 14);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 17, pageW - margin, 17);
    doc.setTextColor(30, 30, 30);
    y = 22;
  }

  // ── Cover ─────────────────────────────────────────────────────────────────
  drawHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text("📓 My Notes", margin, y); y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Paper: ${paperLabel ?? paperId}`, margin, y); y += 6;
  if (variant) { doc.text(`Variant: ${variant}`, margin, y); y += 6; }
  if (session) { doc.text(`Session: ${session}`, margin, y); y += 6; }
  if (userEmail) { doc.text(`Student: ${userEmail}`, margin, y); y += 6; }
  doc.text(`Generated: ${dateStr}`, margin, y); y += 6;
  y += 4;

  const noteCount = Object.keys(notes).length;
  const starCount = Object.keys(starredQuestions).length;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const summary = wrap(
    `This document contains ${noteCount} note${noteCount !== 1 ? "s" : ""} and ${starCount} starred question${starCount !== 1 ? "s" : ""} for offline review and teacher consultation.`,
    contentW
  );
  summary.forEach(line => { doc.text(line, margin, y); y += 5; });
  y += 6;

  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, pageW - margin, y); y += 10;

  // ── SECTION 1: My Notes ───────────────────────────────────────────────────
  const noteEntries = questions
    .map(q => ({ q, note: notes[q.id] }))
    .filter(({ note }) => note?.text);

  if (noteEntries.length > 0) {
    checkSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text("📝 My Notes", margin, y); y += 8;

    noteEntries.forEach(({ q, note }) => {
      checkSpace(28);

      // Question header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(`Q${q.number} — ${q.topic}`, margin, y); y += 6;

      // Question text (truncated)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const qLines = wrap(q.text ?? "", contentW);
      const displayLines = qLines.slice(0, 3);
      displayLines.forEach(line => { checkSpace(5); doc.text(line, margin, y); y += 4.5; });
      if (qLines.length > 3) { doc.text("…", margin, y); y += 4.5; }
      y += 2;

      // Student's note
      doc.setFillColor(248, 251, 248);
      const noteLines = wrap(note.text, contentW - 6);
      const noteH = noteLines.length * 5 + 8;
      checkSpace(noteH);
      doc.setDrawColor(34, 139, 34);
      doc.roundedRect(margin, y, contentW, noteH, 2, 2, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(34, 100, 34);
      doc.text("My note:", margin + 3, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 60, 30);
      noteLines.forEach((line, li) => { doc.text(line, margin + 3, y + 10 + li * 5); });
      y += noteH + 4;

      // Correct answer
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(34, 139, 34);
      doc.text(`Correct answer: ${q.correct}  —  ${q.options?.[q.correct] ?? ""}`, margin, y); y += 5;
      doc.setTextColor(30, 30, 30);

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y + 1, pageW - margin, y + 1); y += 7;
    });
  }

  // ── SECTION 2: Starred Questions (with teacher questions) ─────────────────
  const starredEntries = Object.values(starredQuestions).sort((a, b) => a.questionNumber - b.questionNumber);

  if (starredEntries.length > 0) {
    checkSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text("⭐ Starred Questions for Teacher Review", margin, y); y += 8;

    starredEntries.forEach(entry => {
      checkSpace(30);

      // Question header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(`⭐ Q${entry.questionNumber} — ${entry.topic ?? ""}`, margin, y); y += 6;

      // Question text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      const qLines = wrap(entry.questionText ?? "", contentW);
      qLines.slice(0, 4).forEach(line => { checkSpace(5); doc.text(line, margin, y); y += 4.5; });
      if (qLines.length > 4) { doc.text("…", margin, y); y += 4.5; }
      y += 2;

      // Options (abbreviated)
      if (entry.options) {
        ["A", "B", "C", "D"].forEach(k => {
          const isCorrect = k === entry.correctAnswer;
          const optText = `${k}: ${entry.options[k] ?? ""}`;
          const optLines = wrap(optText, contentW - 6);
          checkSpace(optLines.length * 4.5 + 1);
          doc.setFont("helvetica", isCorrect ? "bold" : "normal");
          doc.setFontSize(8);
          doc.setTextColor(isCorrect ? 34 : 70, isCorrect ? 139 : 70, isCorrect ? 34 : 70);
          optLines.forEach(line => { doc.text(line, margin + 3, y); y += 4.5; });
        });
        doc.setTextColor(30, 30, 30);
        y += 2;
      }

      // AI Feedback
      if (entry.feedback) {
        const fb = entry.feedback;
        const feedbackSections = [
          { label: "Exam Takeaway", content: fb.pulse_layer_1, color: [22, 163, 74] },
          { label: "Cambridge Insight", content: fb.cambridge_insight, color: [37, 99, 235] },
          { label: "The Tipping Point", content: fb.step3_tipping_point, color: [217, 119, 6] },
        ].filter(s => s.content);

        feedbackSections.forEach(s => {
          const lines = wrap(s.content, contentW - 6);
          checkSpace(lines.length * 4.5 + 8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(s.color[0], s.color[1], s.color[2]);
          doc.text(s.label + ":", margin, y); y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(50, 50, 50);
          lines.forEach(line => { checkSpace(5); doc.text(line, margin + 3, y); y += 4.5; });
          y += 2;
        });
      }

      // Student's note for this question (if any)
      const questionNote = notes[Object.keys(questions.reduce((acc, q) => { acc[q.id] = q; return acc; }, {})).find(id => {
        const q = questions.find(q => q.number === entry.questionNumber);
        return q && id === q.id;
      })];
      if (questionNote?.text) {
        const noteLines = wrap(questionNote.text, contentW - 6);
        const noteH = noteLines.length * 5 + 8;
        checkSpace(noteH);
        doc.setDrawColor(34, 139, 34);
        doc.roundedRect(margin, y, contentW, noteH, 2, 2, "S");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(34, 100, 34);
        doc.text("My note:", margin + 3, y + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 60, 30);
        noteLines.forEach((line, li) => { doc.text(line, margin + 3, y + 10 + li * 5); });
        y += noteH + 4;
      }

      // Question for teacher
      if (entry.teacherQuestion?.trim()) {
        const tqLines = wrap(entry.teacherQuestion, contentW - 6);
        const tqH = tqLines.length * 5 + 10;
        checkSpace(tqH);
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(180, 130, 0);
        doc.roundedRect(margin, y, contentW, tqH, 2, 2, "S");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(120, 80, 0);
        doc.text("❓ Question for teacher:", margin + 3, y + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 60, 0);
        tqLines.forEach((line, li) => { doc.text(line, margin + 3, y + 11 + li * 5); });
        y += tqH + 4;
      }

      // Divider
      checkSpace(6);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y + 1, pageW - margin, y + 1); y += 8;
    });
  }

  // Footer
  checkSpace(10);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text("Generated by Cambridge Hub — cambridgehub.base44.app", margin, y);

  const safeLabel = (paperLabel ?? paperId).replace(/[\/\s]/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `MyNotes_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try {
    doc.save(filename);
  } catch {
    window.open(doc.output("bloburl"), "_blank");
  }
}