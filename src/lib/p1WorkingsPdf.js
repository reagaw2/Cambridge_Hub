/**
 * p1WorkingsPdf.js — PDF export of saved scratchpad workings.
 * Each question gets: question number + topic header, question text, then the working image(s).
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
  const margin = 18;
  const contentW = pageW - margin * 2;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let pageNum = 1;
  let y = 0;

  function drawFooter() {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text("Cambridge Hub — My Workings", margin, pageH - 10);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 10, { align: "right" });
    pageNum++;
    doc.setTextColor(30, 30, 30);
  }

  function checkSpace(needed) {
    if (y + needed > pageH - 24) {
      drawFooter();
      doc.addPage();
      y = margin;
    }
  }

  function wrap(text, maxW) {
    return doc.splitTextToSize(String(text ?? ""), maxW);
  }

  // ── Cover page ───────────────────────────────────────────────────────────
  y = 32;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 20);
  doc.text("My Workings", margin, y); y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(70, 70, 70);
  doc.text("Submitted for Teacher Review", margin, y); y += 10;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y); y += 10;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  if (paperLabel ?? paperId) { doc.text(`Paper: ${paperLabel ?? paperId}`, margin, y); y += 7; }
  if (userEmail) { doc.text(`Student: ${userEmail}`, margin, y); y += 7; }
  doc.text(`Generated: ${dateStr}`, margin, y); y += 7;

  // Sort by question number
  const workingEntries = Object.entries(workings).sort((a, b) => {
    const qa = questions.find(q => q.id === a[0]);
    const qb = questions.find(q => q.id === b[0]);
    return (qa?.number ?? a[1].questionNumber ?? 0) - (qb?.number ?? b[1].questionNumber ?? 0);
  });

  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `${workingEntries.length} question working${workingEntries.length !== 1 ? "s" : ""} included`,
    margin, y
  );
  y += 14;

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y); y += 14;

  drawFooter();

  // ── Per-question workings ─────────────────────────────────────────────────
  for (const [questionId, entry] of workingEntries) {
    const q = questions.find(qq => qq.id === questionId);
    const qNumber = entry.questionNumber ?? q?.number ?? "?";
    const qTopic = entry.topic ?? q?.topic ?? "Unknown";
    const qText = q?.text ?? entry.questionText ?? "";

    checkSpace(50);

    // Question header band
    doc.setFillColor(235, 245, 255);
    doc.setDrawColor(180, 210, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 50, 100);
    doc.text(`Question ${qNumber}`, margin + 4, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 100, 140);
    const topicX = margin + 4 + doc.getTextWidth(`Question ${qNumber}`) + 5;
    doc.text(`— ${qTopic}`, topicX, y + 9);
    y += 18;

    // Question text
    if (qText) {
      const qLines = wrap(qText, contentW);
      checkSpace(qLines.length * 5.5 + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      qLines.forEach(line => {
        checkSpace(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 6;
    }

    // Working image(s)
    const sides = entry.sides ?? {};
    const sideKeys = Object.keys(sides).sort(); // "left" before "right"

    for (const sideKey of sideKeys) {
      const imageData = sides[sideKey];
      if (!imageData) continue;

      // Estimate image dimensions from data URL (we don't know exact pixel dims,
      // so use a consistent height that fits well on A4)
      const imgW = contentW;
      const imgH = 90; // 90mm ≈ one third of an A4 page — good for working

      checkSpace(imgH + 22);

      // Side label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        sideKeys.length > 1 ? `Working (${sideKey} side)` : "Working",
        margin, y
      );
      y += 5;

      // Bordered image area
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(246, 241, 228); // paper background colour
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, imgW, imgH, 2, 2, "FD");

      try {
        const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
        const format = imageData.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
        doc.addImage(base64, format, margin + 1, y + 1, imgW - 2, imgH - 2, undefined, "FAST");
      } catch (e) {
        console.warn("[p1WorkingsPdf] addImage failed:", e);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("(Working image could not be embedded)", margin + 4, y + imgH / 2);
      }

      y += imgH + 10;
    }

    // Divider between questions
    checkSpace(8);
    y += 2;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 12;
  }

  drawFooter();

  const safeLabel = (paperLabel ?? paperId ?? "workings")
    .replace(/[\/\s]/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
  const filename = `Workings_${safeLabel}_${dateStr.replace(/\s/g, "")}.pdf`;
  try { doc.save(filename); } catch { window.open(doc.output("bloburl"), "_blank"); }
}