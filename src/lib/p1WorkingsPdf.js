/**
 * p1WorkingsPdf.js — PDF export of saved scratchpad workings.
 * Clean layout: question number + topic on separate lines, question text wrapped,
 * working image below with a labelled border.
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

export async function generateWorkingsPdf({ paperId, paperLabel, workings, questions, userEmail }) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
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

  function drawFooter() {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(170, 170, 170);
    doc.text("Cambridge Hub — My Workings", margin, pageH - 10);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: "right" });
    doc.setTextColor(30, 30, 30);
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  // ── Cover page ──────────────────────────────────────────────────────────────
  y = 36;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(15, 30, 80);
  doc.text("My Workings", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(90, 90, 110);
  doc.text("Submitted for Teacher Review", margin, y);
  y += 12;

  doc.setDrawColor(180, 190, 220);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFontSize(10.5);
  doc.setTextColor(55, 55, 75);
  const meta = [
    paperLabel ?? paperId ? `Paper:     ${paperLabel ?? paperId}` : null,
    userEmail                ? `Student:   ${userEmail}`           : null,
    `Generated: ${dateStr}`,
  ].filter(Boolean);
  meta.forEach(line => { doc.text(line, margin, y); y += 7; });

  // Sort by question number
  const workingEntries = Object.entries(workings).sort((a, b) => {
    const qa = questions.find(q => q.id === a[0]);
    const qb = questions.find(q => q.id === b[0]);
    return (qa?.number ?? a[1].questionNumber ?? 0) - (qb?.number ?? b[1].questionNumber ?? 0);
  });

  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 140);
  doc.text(
    `${workingEntries.length} question working${workingEntries.length !== 1 ? "s" : ""} included`,
    margin, y
  );
  y += 14;

  doc.setDrawColor(180, 190, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  drawFooter();

  // ── Per-question entries ────────────────────────────────────────────────────
  workingEntries.forEach(([questionId, entry], entryIdx) => {
    const q = questions.find(qq => qq.id === questionId);
    const qNumber  = entry.questionNumber ?? q?.number ?? "?";
    const qTopic   = entry.topic          ?? q?.topic  ?? "";
    const qText    = q?.text              ?? entry.questionText ?? "";
    const sides    = entry.sides ?? {};
    const sideKeys = Object.keys(sides).sort();

    // Estimate height needed for this entry
    const qTextLines = wrap(qText, contentW);
    const textBlockH = qTextLines.length * 5.5 + 6;
    const imgH       = 80; // consistent working image height
    const totalNeeded = 40 + textBlockH + sideKeys.length * (imgH + 22);

    // If not enough space on this page start a new one (unless it's the very first entry)
    if (entryIdx > 0) checkSpace(Math.min(totalNeeded, 80));

    // ── Question header card ──────────────────────────────────────────────────
    // Blue header band: question number (large) + topic below it on a second line
    const headerH = 22;
    doc.setFillColor(232, 240, 255);
    doc.setDrawColor(170, 200, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, headerH, 3, 3, "FD");

    // "Question N" — large bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 40, 100);
    doc.text(`Question ${qNumber}`, margin + 5, y + 9);

    // topic — smaller, muted, below the number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 110, 160);
    doc.text(qTopic, margin + 5, y + 17);

    y += headerH + 6;

    // ── Question text ─────────────────────────────────────────────────────────
    if (qText) {
      checkSpace(textBlockH + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      qTextLines.forEach(line => {
        checkSpace(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 6;
    }

    // ── Working image(s) ──────────────────────────────────────────────────────
    sideKeys.forEach((sideKey, si) => {
      const imageData = sides[sideKey];
      if (!imageData) return;

      checkSpace(imgH + 20);

      // "Working" label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 100);
      const workingLabel = sideKeys.length > 1 ? `Working — ${sideKey} side` : "Working";
      doc.text(workingLabel, margin, y);
      y += 5;

      // Bordered image box with paper-coloured background
      doc.setDrawColor(190, 195, 210);
      doc.setFillColor(246, 241, 228);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentW, imgH, 2, 2, "FD");

      try {
        const base64  = imageData.replace(/^data:image\/\w+;base64,/, "");
        const format  = imageData.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
        // 1 mm padding inside the border
        doc.addImage(base64, format, margin + 1, y + 1, contentW - 2, imgH - 2, undefined, "FAST");
      } catch (e) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(160, 160, 160);
        doc.text("(Working image could not be embedded)", margin + 4, y + imgH / 2);
      }

      y += imgH + 4;

      // Saved timestamp
      if (entry.savedAt) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(160, 160, 170);
        doc.text(
          `Saved ${new Date(entry.savedAt).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}`,
          margin, y
        );
        y += 5;
      }
    });

    // ── Divider between questions ─────────────────────────────────────────────
    y += 4;
    checkSpace(6);
    doc.setDrawColor(210, 215, 230);
    doc.setLineWidth(0.35);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
  });

  drawFooter();

  const safeLabel = (paperLabel ?? paperId ?? "workings")
    .replace(/[\/\s]/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `Workings_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}