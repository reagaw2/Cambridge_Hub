/**
 * p1NotesPdf.js — My Notes PDF.
 * Clean layout: cover page, then per-question notes with question header card,
 * question text, and the note in a tinted box — all properly wrapped.
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

export async function generateNotesPdf({ paperId, paperLabel, session, variant, notes, questions, userEmail }) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  const pageW   = 210;
  const pageH   = 297;
  const margin  = 20;
  const contentW = pageW - margin * 2;   // 170 mm usable width
  const LINE_H  = 5.5;                    // standard line height (mm)
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  let pageNum = 1;
  let y = margin;

  function newPage() {
    drawFooter();
    doc.addPage();
    pageNum++;
    y = margin;
  }

  function checkSpace(needed) {
    if (y + needed > pageH - 22) newPage();
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  function drawFooter() {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(170, 170, 170);
    doc.text("Cambridge Hub — My Notes", margin, pageH - 10);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: "right" });
    doc.setTextColor(30, 30, 30);
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
  const meta = [
    paperLabel ?? paperId ? `Paper:     ${paperLabel ?? paperId}` : null,
    session               ? `Session:   ${session}`               : null,
    userEmail             ? `Student:   ${userEmail}`             : null,
    `Generated: ${dateStr}`,
  ].filter(Boolean);
  meta.forEach(line => { doc.text(line, margin, y); y += 7; });

  // Only entries that actually have text
  const noteEntries = questions
    .map(q => ({ q, note: notes[q.id] }))
    .filter(({ note }) => note?.text?.trim());

  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(100, 130, 110);
  doc.text(
    `${noteEntries.length} note${noteEntries.length !== 1 ? "s" : ""} in this document`,
    margin, y
  );
  y += 14;

  doc.setDrawColor(150, 200, 160);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  drawFooter();

  // ── Per-question notes ──────────────────────────────────────────────────────
  noteEntries.forEach(({ q, note }, entryIdx) => {
    const noteLines  = wrap(note.text.trim(), contentW - 10); // 5 mm padding each side
    const qTextLines = wrap(q.text ?? "", contentW);

    const headerH   = 22;
    const qTextH    = qTextLines.length * LINE_H + 6;
    const noteBoxH  = noteLines.length  * LINE_H + 14; // top + bottom padding
    const totalNeeded = headerH + 8 + qTextH + noteBoxH + 16;

    if (entryIdx > 0) checkSpace(Math.min(totalNeeded, 80));

    // ── Question header card ──────────────────────────────────────────────────
    doc.setFillColor(232, 248, 236);
    doc.setDrawColor(150, 200, 160);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, headerH, 3, 3, "FD");

    // "Question N" — bold, large
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(10, 70, 30);
    doc.text(`Question ${q.number}`, margin + 5, y + 9);

    // topic — smaller, below
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 110, 70);
    doc.text(q.topic ?? "", margin + 5, y + 17);

    y += headerH + 6;

    // ── Question text ─────────────────────────────────────────────────────────
    if (q.text) {
      checkSpace(qTextH + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
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

    // Tinted background + border
    doc.setFillColor(240, 252, 242);
    doc.setDrawColor(140, 195, 150);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, noteBoxH, 3, 3, "FD");

    // "My Note" label inside the box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(50, 110, 70);
    doc.text("MY NOTE", margin + 5, y + 6);

    // Note text — wrapped, indented 5 mm from each side
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
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
    .replace(/[\/\s]/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `MyNotes_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}