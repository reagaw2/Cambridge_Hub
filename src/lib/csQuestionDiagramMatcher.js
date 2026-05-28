import { PRELOADED_PAIRS } from "@/lib/ingestorQuestions";

/**
 * Match a Supabase question row to its PRELOADED_PAIRS entry by word overlap.
 * Returns the matched pair or null.
 */
export function matchDiagramToQuestion(supabaseQuestion) {
  const qText = (supabaseQuestion.question_text ?? "").toLowerCase();
  let bestScore = 0;
  let bestPair = null;

  for (const pair of PRELOADED_PAIRS) {
    const pText = (pair.question ?? "").toLowerCase();
    const qWords = new Set(qText.match(/\b[a-z]{4,}\b/g) ?? []);
    const pWords = pText.match(/\b[a-z]{4,}\b/g) ?? [];

    let score = 0;
    for (const word of pWords) {
      if (qWords.has(word)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestPair = pair;
    }
  }

  return bestScore >= 8 ? bestPair : null;
}

/**
 * extractDiagramConfig
 *
 * Returns one of:
 *   { type: "matching",   ...matchingProps }   — interactive matching component
 *   { type: "table_fill", ...tableProps }       — interactive table fill component
 *   { type: "register",   ...registerProps }    — interactive register component
 *   { type: "svg",        svgString }           — static reference image (read-only)
 *   null                                        — no diagram needed
 *
 * Decision rule:
 *   - If the question TEXT explicitly asks the student to draw lines / complete
 *     the table / fill in the register → interactive component, NO svg shown.
 *   - If the question has a diagram that the student only needs to READ in order
 *     to answer a written question → static svg only.
 *   - If no diagram exists → null.
 */
export function extractDiagramConfig(pair) {
  if (!pair) return null;

  const qText = pair.question ?? "";

  // ── Interactive: matching ────────────────────────────────────────────────
  if (/draw\s+(a\s+)?line|draw\s+one\s+line|link\s+each|match\s+each/i.test(qText)) {
    const config = extractMatchingConfig(qText);
    if (config) return { type: "matching", ...config };
  }

  // ── Interactive: table fill ──────────────────────────────────────────────
  if (
    /complete\s+the\s+table|fill\s+in\s+the\s+(table|blank|missing)/i.test(qText) ||
    /write\s+the\s+(correct\s+)?(term|definition|word|value)\s+in/i.test(qText)
  ) {
    const config = extractTableConfig(pair);
    if (config) return { type: "table_fill", ...config };
  }

  // ── Interactive: register ────────────────────────────────────────────────
  if (/write\s+(your answer\s+)?in the register|write\s+it\s+in\s+the\s+register/i.test(qText)) {
    const config = extractRegisterConfig(pair);
    if (config) return { type: "register", ...config };
  }

  // ── Static reference SVG only (student reads it, does NOT interact) ──────
  // Questions that say "shown above", "the diagram shows", "the table shows",
  // "the register contains", "the image above", etc.
  if (pair.diagram_svg) {
    const hasReferenceLanguage =
      /shown above|the (diagram|table|image|register|figure|screen|grid)\s+(above|shows|below)|contains the (8|12).bit|refer to the/i.test(qText) ||
      // Register questions where the pre-filled value is provided for reading
      /register\s+[A-Z]\s+contains\s+the\s+(8|12).bit\s+value/i.test(qText);

    if (hasReferenceLanguage) {
      return { type: "svg", svgString: pair.diagram_svg };
    }

    // Has a diagram_svg but none of the above — still show it as reference
    return { type: "svg", svgString: pair.diagram_svg };
  }

  return null;
}

// ── Matching config ──────────────────────────────────────────────────────────

function extractMatchingConfig(questionText) {
  // Q9/Q10: max colours → min bits
  if (/max(imum)?\s+(number\s+of\s+)?colours|min(imum)?\s+(number\s+of\s+)?bits/i.test(questionText)) {
    return {
      leftLabel: "Max number of colours",
      rightLabel: "Min bits needed",
      leftItems: ["68", "256", "127", "2", "249"],
      rightItems: ["1", "2", "3", "7", "8", "9"],
    };
  }

  // Q33: values → denary
  if (/hexadecimal.*bcd.*binary.*two'?s\s+comp/i.test(questionText) || /hex.*3a|bcd.*0100\s*1001/i.test(questionText)) {
    return {
      leftLabel: "Value",
      rightLabel: "Denary",
      leftItems: ["Hex: 3A", "BCD: 0100 1001", "Binary: 01011101", "Two's complement: 11000001"],
      rightItems: ["93", "−65", "58", "−63", "73", "49", "−93"],
    };
  }

  // Q37: bitmap terms → descriptions
  if (/bitmap\s+graphic|image\s+file\s+header|image\s+resolution|vector\s+graphic/i.test(questionText)) {
    return {
      leftLabel: "Term",
      rightLabel: "Description",
      leftItems: ["Bitmap graphic", "Image file header", "Image resolution", "Pixel", "Screen resolution", "Vector graphic"],
      rightItems: [
        "Measured in dots per inch (dpi)",
        "Picture element",
        "Image made up of rows and columns of pixels",
        "Image made up of drawing objects with properties",
        "Specifies the image size, number of colours and other data",
        "Samples per second to represent some event digitally",
        "Monitor specification e.g. 1024×768",
      ],
    };
  }

  return null;
}

// ── Table fill config ────────────────────────────────────────────────────────

function extractTableConfig(pair) {
  const q = pair.question ?? "";

  // Q3/Q4 sound table
  if (/sampling rate|sampling resolution/i.test(q) && /term|definition|complete the table/i.test(q)) {
    return {
      headers: ["Term", "Definition"],
      rows: [
        ["Sampling", ""],
        ["", "The number of samples per unit time"],
        ["Sampling resolution", ""],
      ],
    };
  }

  // Q17/Q18 lossy/lossless table
  if (/lossy|lossless/i.test(q) && /cropping|run.length|colour depth/i.test(q)) {
    return {
      headers: ["Compression method", "Lossy ✓", "Lossless ✓"],
      rows: [
        ["Cropping the image", "", ""],
        ["Reducing the resolution of the image", "", ""],
        ["Using run-length encoding (RLE)", "", ""],
        ["Reducing the colour depth of the image", "", ""],
      ],
    };
  }

  // Q2 ASCII table
  if (/ascii.*denary.*hex|character.*'t'|complete.*table.*ascii/i.test(q)) {
    return {
      headers: ["Character", "ASCII denary value", "ASCII hex value"],
      rows: [
        ["a", "97", "61"],
        ["b", "98", "62"],
        ["c", "99", "63"],
        ["t", "", ""],
      ],
    };
  }

  return null;
}

// ── Register config ──────────────────────────────────────────────────────────

function extractRegisterConfig(pair) {
  const q = pair.question ?? "";

  // Q27 two registers (55 and −102)
  if (/55.*−?102|102.*55/i.test(q)) {
    return {
      registers: [
        { label: "55", bits: 8 },
        { label: "−102", bits: 8 },
      ],
    };
  }

  // Q34 two registers (114 and −93)
  if (/114.*−?93|93.*114/i.test(q)) {
    return {
      registers: [
        { label: "114", bits: 8 },
        { label: "−93", bits: 8 },
      ],
    };
  }

  // Q36 two registers (124 and −77)
  if (/124.*−?77|77.*124/i.test(q)) {
    return {
      registers: [
        { label: "124", bits: 8 },
        { label: "−77", bits: 8 },
      ],
    };
  }

  // Q26 12-bit register
  if (/12.bit/i.test(q)) {
    return {
      registers: [{ label: "12-bit register", bits: 12 }],
    };
  }

  return null;
}