import { PRELOADED_PAIRS } from "@/lib/ingestorQuestions";

/**
 * Detects which interactive component type a question needs.
 * Returns one of: "register" | "matching" | "table_fill" | "pixel_grid" | "text" | "bcd_register"
 */
export function detectQuestionType(questionText = "") {
  const t = questionText.toLowerCase();

  if (/register\s+[a-z]\s+contains|write\s+(your answer\s+)?in the register|two's complement.*(register|binary)|convert.*(denary|binary).*(register)/i.test(questionText)) {
    return "register";
  }
  if (/draw\s+(a\s+)?line|draw\s+one\s+line|match\s+each|link\s+each|connect\s+each/i.test(questionText)) {
    return "matching";
  }
  if (/complete\s+the\s+table|fill\s+in\s+the\s+(table|blank|missing)|the\s+table\s+(above\s+)?shows.*blank|write\s+the\s+(correct\s+)?(term|definition|word|value)\s+in/i.test(questionText)) {
    return "table_fill";
  }
  if (/pixel|bitmap|colour\s+the|shade\s+the|grid/i.test(questionText) && /colour|shade|fill/i.test(questionText)) {
    return "pixel_grid";
  }
  return "text";
}

/**
 * Finds the best-matching PRELOADED_PAIRS entry for a Supabase question row
 * by comparing key phrases from the question text.
 * Returns the matched pair or null.
 */
export function matchDiagramToQuestion(supabaseQuestion) {
  const qText = (supabaseQuestion.question_text ?? "").toLowerCase();

  // Score each preloaded pair by word overlap
  let bestScore = 0;
  let bestPair = null;

  for (const pair of PRELOADED_PAIRS) {
    const pText = (pair.question ?? "").toLowerCase();

    // Extract meaningful words (length > 4) from both sides
    const qWords = new Set(qText.match(/\b[a-z]{4,}\b/g) ?? []);
    const pWords = (pText.match(/\b[a-z]{4,}\b/g) ?? []);

    let score = 0;
    for (const word of pWords) {
      if (qWords.has(word)) score++;
    }

    // Boost score if question numbers / key phrases match exactly
    const qNum = qText.match(/question\s+(\d+)/)?.[1];
    const pNum = pText.match(/question\s+(\d+)/)?.[1];
    if (qNum && pNum && qNum === pNum) score += 5;

    if (score > bestScore) {
      bestScore = score;
      bestPair = pair;
    }
  }

  // Only return a match if confidence is high enough
  return bestScore >= 8 ? bestPair : null;
}

/**
 * Extracts structured diagram config from a PRELOADED_PAIRS entry.
 * Returns { type, svgString, matchingConfig, tableConfig, registerConfig } or null.
 */
export function extractDiagramConfig(pair) {
  if (!pair) return null;

  const qText = (pair.question ?? "").toLowerCase();

  // Matching question config
  if (/draw\s+(a\s+)?line|draw\s+one\s+line|link\s+each|match\s+each/i.test(pair.question)) {
    const config = extractMatchingConfig(pair.question);
    if (config) return { type: "matching", ...config };
  }

  // Table fill config
  if (/complete\s+the\s+table|fill\s+in\s+the\s+(table|blank)|blank\s+cell|write\s+the\s+(correct\s+)?(term|definition)/i.test(pair.question)) {
    const config = extractTableConfig(pair);
    if (config) return { type: "table_fill", ...config };
  }

  // Register config
  if (/register\s+[a-z]\s+contains|write\s+(your answer\s+)?in the register/i.test(pair.question)) {
    const config = extractRegisterConfig(pair);
    if (config) return { type: "register", ...config };
  }

  // Static SVG diagram
  if (pair.diagram_svg) return { type: "svg", svgString: pair.diagram_svg };

  return null;
}

// ── Matching config extractors ────────────────────────────────────────────────

function extractMatchingConfig(questionText) {
  // Q9/Q10: max colours → min bits
  if (/max(imum)?\s+number\s+of\s+colours|min(imum)?\s+(number\s+of\s+)?bits/i.test(questionText)) {
    return {
      leftLabel: "Max number of colours",
      rightLabel: "Min bits needed",
      leftItems: ["68", "256", "127", "2", "249"],
      rightItems: ["1", "2", "3", "7", "8", "9"],
      correctAnswers: [
        { from: 0, to: 3 }, // 68 → 7 bits
        { from: 1, to: 4 }, // 256 → 8 bits
        { from: 2, to: 3 }, // 127 → 7 bits
        { from: 3, to: 0 }, // 2 → 1 bit
        { from: 4, to: 4 }, // 249 → 8 bits
      ],
    };
  }

  // Q33: values → denary
  if (/hexadecimal.*bcd.*binary.*two'?s\s+comp/i.test(questionText) || /hex.*3a|bcd.*0100\s*1001/i.test(questionText)) {
    return {
      leftLabel: "Value",
      rightLabel: "Denary",
      leftItems: ["Hex: 3A", "BCD: 0100 1001", "Binary: 01011101", "Two's complement: 11000001"],
      rightItems: ["93", "−65", "58", "−63", "73", "49", "−93"],
      correctAnswers: [
        { from: 0, to: 2 }, // 3A → 58
        { from: 1, to: 5 }, // BCD 0100 1001 → 49
        { from: 2, to: 0 }, // 01011101 → 93
        { from: 3, to: 3 }, // 11000001 → −63
      ],
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

// ── Table config extractor ────────────────────────────────────────────────────

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

  // Q17 lossy/lossless table
  if (/lossy|lossless/i.test(q) && /cropping|run.length|colour depth/i.test(q)) {
    return {
      headers: ["Compression method", "Lossy ✓", "Lossless ✓"],
      rows: [
        ["Cropping the image", "", ""],
        ["Reducing the resolution of the image", "", ""],
        ["Using run-length encoding (RLE)", "", ""],
        ["Reducing the colour depth of the image", "", ""],
      ],
      radioColumns: [1, 2],
    };
  }

  // Q2 ASCII table (character 't')
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

// ── Register config extractor ─────────────────────────────────────────────────

function extractRegisterConfig(pair) {
  const q = pair.question ?? "";

  // Q27 two registers (55 and −102)
  if (/55.*−?102|102.*55/i.test(q)) {
    return {
      registers: [
        { label: "55", bits: 8, placeholder: "Enter 8-bit binary for 55" },
        { label: "−102", bits: 8, placeholder: "Enter 8-bit two's complement for −102" },
      ],
    };
  }

  // Q34 two registers (114 and −93)
  if (/114.*−?93|93.*114/i.test(q)) {
    return {
      registers: [
        { label: "114", bits: 8, placeholder: "Enter 8-bit binary for 114" },
        { label: "−93", bits: 8, placeholder: "Enter 8-bit two's complement for −93" },
      ],
    };
  }

  // Q36 two registers (124 and −77)
  if (/124.*−?77|77.*124/i.test(q)) {
    return {
      registers: [
        { label: "124", bits: 8, placeholder: "Enter 8-bit binary for 124" },
        { label: "−77", bits: 8, placeholder: "Enter 8-bit two's complement for −77" },
      ],
    };
  }

  // Single registers (Q15, Q18, Q20, Q22)
  const singleMatch = q.match(/register\s+([A-Z])\s+contains\s+the\s+8.bit\s+value[\s\S]*?([01]{8})/i);
  if (singleMatch) {
    return {
      registers: [
        { label: `Register ${singleMatch[1]}`, bits: 8, prefilled: singleMatch[2] },
      ],
    };
  }

  // Q26 12-bit register
  if (/12.bit/i.test(q)) {
    return {
      registers: [
        { label: "12-bit register", bits: 12 },
      ],
    };
  }

  return null;
}