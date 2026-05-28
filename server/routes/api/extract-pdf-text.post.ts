import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

/**
 * Very lightweight PDF text extractor.
 * Handles standard PDFs with embedded text streams.
 * For scanned/image PDFs the text will be empty — the client should warn the user.
 */
function extractTextFromPdfBytes(bytes: Uint8Array): string {
  const decoder = new TextDecoder("latin1");
  const raw = decoder.decode(bytes);

  const lines: string[] = [];

  // Extract text from BT...ET blocks (PDF text operators)
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Extract strings from Tj, TJ, ' operators
    const tjRegex = /\(([^)]*)\)\s*(?:Tj|')/g;
    let tjMatch;
    const lineChunks: string[] = [];
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const text = tjMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\t/g, " ")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      lineChunks.push(text);
    }

    // TJ arrays
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const content = tjArrMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(content)) !== null) {
        lineChunks.push(strMatch[1]);
      }
    }

    if (lineChunks.length > 0) {
      lines.push(lineChunks.join(" ").trim());
    }
  }

  // Also try to grab any plain readable text (for older PDF formats)
  const plainText = raw.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s{3,}/g, "\n");
  const readableLines = plainText.split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 4 && /[a-zA-Z]{2,}/.test(l));

  const extracted = lines.join("\n") + "\n" + readableLines.join("\n");
  return extracted.replace(/\n{3,}/g, "\n\n").trim();
}

export default defineHandler(async (event) => {
  const body = await readBody<{ base64: string; filename: string }>(event);

  if (!body?.base64) {
    throw createError({ statusCode: 400, statusMessage: "base64 PDF data is required" });
  }

  try {
    const binaryStr = atob(body.base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    const text = extractTextFromPdfBytes(bytes);
    const isLikelyScanned = text.length < 200;

    return {
      text,
      characterCount: text.length,
      isLikelyScanned,
      warning: isLikelyScanned
        ? "Very little text was extracted — this PDF may be scanned/image-based. Consider copying the text manually."
        : null,
    };
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `PDF extraction failed: ${err.message}` });
  }
});