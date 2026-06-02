/**
 * sanitisePdf.js — convert unicode characters that jsPDF's built-in
 * helvetica font cannot render into clean ASCII equivalents.
 *
 * Rules:
 *   Superscripts  →  ^n         (10²²  →  10^22)
 *   Subscripts    →  digit only (y₁    →  y1,  NO underscore)
 *   Greek letters →  short name (λ     →  lambda)
 *   Math symbols  →  ASCII      (×     →  x)
 */
export function sanitisePdf(str) {
  if (!str) return "";
  return String(str)
    // ── Superscripts ────────────────────────────────────────────────────────
    .replace(/\u00b2/g, "^2")
    .replace(/\u00b3/g, "^3")
    .replace(/\u00b9/g, "^1")
    .replace(/\u2070/g, "^0")
    .replace(/[\u2074-\u2079]/g, c => "^" + (c.codePointAt(0) - 0x2070))
    .replace(/\u207A/g, "^+")
    .replace(/\u207B/g, "^-")

    // ── Subscripts (digit only — NO underscore) ──────────────────────────────
    .replace(/[\u2080-\u2089]/g, c => String(c.codePointAt(0) - 0x2080))
    .replace(/\u208A/g, "+")
    .replace(/\u208B/g, "-")

    // ── Greek letters ────────────────────────────────────────────────────────
    .replace(/\u03b1/g, "alpha")
    .replace(/\u03b2/g, "beta")
    .replace(/\u03b3/g, "gamma").replace(/\u0393/g, "Gamma")
    .replace(/\u03b4/g, "delta").replace(/\u0394/g, "Delta")
    .replace(/\u03b5/g, "epsilon")
    .replace(/\u03b7/g, "eta")
    .replace(/\u03b8/g, "theta").replace(/\u0398/g, "Theta")
    .replace(/\u03ba/g, "kappa")
    .replace(/\u03bb/g, "lambda").replace(/\u039b/g, "Lambda")
    .replace(/\u03bc/g, "mu")
    .replace(/\u03bd/g, "nu")
    .replace(/\u03c0/g, "pi").replace(/\u03a0/g, "Pi")
    .replace(/\u03c1/g, "rho")
    .replace(/\u03c3/g, "sigma").replace(/\u03a3/g, "Sigma")
    .replace(/\u03c4/g, "tau")
    .replace(/\u03c6/g, "phi").replace(/\u03a6/g, "Phi")
    .replace(/\u03c9/g, "omega").replace(/\u03a9/g, "Omega")

    // ── Math operators ───────────────────────────────────────────────────────
    .replace(/\u00d7/g, "x")
    .replace(/\u00f7/g, "/")
    .replace(/\u2212/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "--")
    .replace(/\u2260/g, "!=")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u221a/g, "sqrt")
    .replace(/\u221e/g, "inf")
    .replace(/\u2248/g, "~=")
    .replace(/\u00b0/g, " deg")
    .replace(/\u00b1/g, "+/-")

    // ── Arrows ───────────────────────────────────────────────────────────────
    .replace(/\u2192/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2194/g, "<->")

    // ── Typography ───────────────────────────────────────────────────────────
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, "...")

    // ── Any remaining non-Latin-1 ────────────────────────────────────────────
    .replace(/[^\x00-\xFF]/g, " ");
}