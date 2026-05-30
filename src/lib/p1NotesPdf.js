/**
 * p1NotesPdf.js — My Notes PDF.
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

export async function generateNotesPdf({ paperId, paperLabel, session, notes, questions, userEmail }) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;   // 170 mm
  const LINE_H = 5.5;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  let pageNum = 1;
  let y = margin;

  function drawFooter() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text("Cambridge Hub — My Notes", margin, pageH - 10);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: "right" });
    pageNum++;
    doc.setTextColor(30, 30, 30);
  }

  function checkSpace(needed) {
    if (y + needed > pageH - 22) {
      drawFooter();
      doc.addPage();
      y = margin;
    }
  }

  // IMPORTANT: always set font+size before calling splitTextToSize so metrics are correct
  function wrapAt(text, fontSize, fontStyle, maxW) {
    doc.setFont("helvetica", fontStyle ?? "normal");
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  // ── Cover page ──────────────────────────────────────────────────────────────
  y = 36;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(15, 80, 40);
  doc.text("My Notes", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(70, 100, 80);
  doc.text("Personal revision notes", margin, y);
  y += 12;

  doc.setDrawColor(150, 200, 160);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFontSize(10.5);
  doc.setTextColor(55, 70, 60);
  [
    paperLabel ?? paperId ? `Paper:     ${paperLabel ?? paperId}` : null,
    session               ? `Session:   ${session}`               : null,
    userEmail             ? `Student:   ${userEmail}`             : null,
    `Generated: ${dateStr}`,
  ].filter(Boolean).forEach(line => { doc.text(line, margin, y); y += 7; });

  const noteEntries = questions
    .map(q => ({ q, note: notes[q.id] }))
    .filter(({ note }) => note?.text?.trim());

  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(100, 130, 110);
  doc.text(`${noteEntries.length} note${noteEntries.length !== 1 ? "s" : ""} in this document`, margin, y);
  y += 14;

  doc.setDrawColor(150, 200, 160);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  drawFooter();

  // ── Per-question notes ──────────────────────────────────────────────────────
  noteEntries.forEach(({ q, note }, entryIdx) => {

    // Pre-calculate line counts with correct font sizes set first
    const qTextLines = wrapAt(q.text ?? "", 10, "normal", contentW);
    const noteLines  = wrapAt(note.text.trim(), 10, "normal", contentW - 10);

    const headerH  = 22;
    const qTextH   = qTextLines.length * LINE_H + 6;
    const noteBoxH = noteLines.length * LINE_H + 14;

    if (entryIdx > 0) checkSpace(Math.min(headerH + qTextH + noteBoxH + 20, 90));

    // ── Header card ──────────────────────────────────────────────────────────
    doc.setFillColor(232, 248, 236);
    doc.setDrawColor(150, 200, 160);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, headerH, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(10, 70, 30);
    doc.text(`Question ${q.number}`, margin + 5, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 110, 70);
    doc.text(q.topic ?? "", margin + 5, y + 17);

    y += headerH + 6;

    // ── Question text ─────────────────────────────────────────────────────────
    if (qTextLines.length > 0) {
      checkSpace(qTextH + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      qTextLines.forEach(line => {
        checkSpace(LINE_H + 1);
        doc.text(line, margin, y);
        y += LINE_H;
      });
      y += 5;
    }

    // ── Note box ──────────────────────────────────────────────────────────────
    checkSpace(noteBoxH + 4);

    doc.setFillColor(240, 252, 242);
    doc.setDrawColor(140, 195, 150);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, noteBoxH, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(50, 110, 70);
    doc.text("MY NOTE", margin + 5, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 60, 35);
    noteLines.forEach((line, li) => {
      doc.text(line, margin + 5, y + 11 + li * LINE_H);
    });

    y += noteBoxH + 10;

    // ── Divider ───────────────────────────────────────────────────────────────
    checkSpace(6);
    doc.setDrawColor(190, 215, 195);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
  });

  drawFooter();

  const safeLabel = (paperLabel ?? paperId ?? "notes")
    .replace(/[\/\s]/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `MyNotes_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}