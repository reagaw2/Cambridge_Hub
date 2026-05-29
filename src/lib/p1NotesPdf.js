/**
 * p1NotesPdf.js — My Notes PDF.
 * Shows: paper details, then for each note: question number + topic + note text only.
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
    if (y + needed > pageH - 22) newPage();
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  function drawFooter() {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text("Cambridge Hub", margin, pageH - 10);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: "right" });
    doc.setTextColor(30, 30, 30);
  }

  // ── Cover page ─────────────────────────────────────────────────────────────
  y = 32;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 20);
  doc.text("My Notes", margin, y); y += 12;

  // Thin rule under title
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y); y += 8;

  // Paper details block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  const paperRef = paperId ?? paperLabel ?? "";
  if (paperRef) { doc.text(paperRef, margin, y); y += 7; }
  if (variant) { doc.text(`Variant: ${variant}`, margin, y); y += 7; }
  if (session) { doc.text(`Session: ${session}`, margin, y); y += 7; }
  if (userEmail) { doc.text(`Student: ${userEmail}`, margin, y); y += 7; }
  doc.text(`Generated: ${dateStr}`, margin, y); y += 7;

  // Count
  const noteEntries = questions.map(q => ({ q, note: notes[q.id] })).filter(({ note }) => note?.text);
  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`${noteEntries.length} note${noteEntries.length !== 1 ? "s" : ""} in this document`, margin, y);
  y += 14;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y); y += 14;

  drawFooter();

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (noteEntries.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(150, 150, 150);
    doc.text("No notes written yet.", margin, y);
    drawFooter();
  }

  noteEntries.forEach(({ q, note }, i) => {
    checkSpace(36);

    // ── Question label ────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(`Question ${q.number}`, margin, y); y += 6;

    // Topic pill
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(q.topic ?? "", margin, y); y += 10;

    // ── Note text ─────────────────────────────────────────────────────────
    const noteLines = wrap(note.text, contentW);
    const noteBlockH = noteLines.length * 5.5 + 12;
    checkSpace(noteBlockH);

    // Light background rect
    doc.setFillColor(246, 249, 246);
    doc.setDrawColor(160, 200, 160);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, noteBlockH, 3, 3, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 60, 30);
    noteLines.forEach((line, li) => {
      doc.text(line, margin + 5, y + 7 + li * 5.5);
    });
    y += noteBlockH + 14;

    // Divider between notes (not after last)
    if (i < noteEntries.length - 1) {
      checkSpace(6);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 12;
    }
  });

  drawFooter();

  const safeLabel = (paperLabel ?? paperId ?? "notes").replace(/[\/\s]/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `MyNotes_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}