/**
 * PulseFeedback — 3-Layer Pulse Answer Engine feedback display.
 *
 * Props:
 *   feedback   — full parsed feedback object from Claude
 *   subject    — "physics" | "cs" | "math"
 *   marksTotal — number
 *   isStreaming — bool
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Zap, BookOpen, Microscope, CheckCircle2, XCircle } from "lucide-react";

const SUBJECT_THEME = {
  physics: {
    accent: "text-cyan-400",
    accentBg: "bg-cyan-400/10",
    accentBorder: "border-cyan-400/30",
    accentGlow: "shadow-[0_0_28px_rgba(34,211,238,0.20)]",
    accentGradient: "from-cyan-400/15 to-transparent",
    accentPill: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",
    label: "The Exam Hack",
    sublabel: "Physics",
    scoreColor: (pct) => pct >= 80 ? "text-cyan-400" : pct >= 50 ? "text-amber-400" : "text-red-400",
    ringColor: (pct) => pct >= 80 ? "#22d3ee" : pct >= 50 ? "#f59e0b" : "#f87171",
  },
  cs: {
    accent: "text-violet-400",
    accentBg: "bg-violet-400/10",
    accentBorder: "border-violet-400/30",
    accentGlow: "shadow-[0_0_28px_rgba(167,139,250,0.20)]",
    accentGradient: "from-violet-400/15 to-transparent",
    accentPill: "bg-violet-400/15 text-violet-300 border-violet-400/30",
    label: "The CS Hack",
    sublabel: "Computer Science",
    scoreColor: (pct) => pct >= 80 ? "text-violet-400" : pct >= 50 ? "text-amber-400" : "text-red-400",
    ringColor: (pct) => pct >= 80 ? "#a78bfa" : pct >= 50 ? "#f59e0b" : "#f87171",
  },
  math: {
    accent: "text-emerald-400",
    accentBg: "bg-emerald-400/10",
    accentBorder: "border-emerald-400/30",
    accentGlow: "shadow-[0_0_28px_rgba(52,211,153,0.20)]",
    accentGradient: "from-emerald-400/15 to-transparent",
    accentPill: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    label: "The Maths Hack",
    sublabel: "Mathematics",
    scoreColor: (pct) => pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400",
    ringColor: (pct) => pct >= 80 ? "#34d399" : pct >= 50 ? "#f59e0b" : "#f87171",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Infer Cambridge notation from mark key + feedback object.
 * Falls back gracefully when Claude doesn't supply pulse_layer_2_marks.
 */
function inferNotation(markKey, feedbackObj) {
  // If Claude returned explicit notation in pulse_layer_2_marks, use it
  // Otherwise derive from key name + keyword heuristics
  const idx = parseInt(markKey.replace("mark_", ""), 10);
  const keyword = (feedbackObj[markKey]?.keyword ?? "").toLowerCase();

  // Cambridge conventions:
  // M1 = method/mandatory mark (usually first mark, must be awarded before A1)
  // A1 = accuracy mark (depends on M1)
  // B1 = independent mark (can be awarded without others)
  // C1 = communication/conclusion mark

  // Use prompt hints baked into keyword strings
  if (keyword.startsWith("m1") || keyword.includes("mandatory") || keyword.includes("must")) return "M1";
  if (keyword.startsWith("a1") || keyword.includes("accuracy") || keyword.includes("consequentially")) return "A1";
  if (keyword.startsWith("c1") || keyword.includes("conclusion") || keyword.includes("communication")) return "C1";

  // Heuristic: first mark in a 2-mark question with M/A structure = M1
  // Detect M/A structure from prompt text stored in cambridge_insight
  const insight = (feedbackObj.cambridge_insight ?? "").toLowerCase();
  if (idx === 1 && insight.includes("m1")) return "M1";
  if (idx === 2 && insight.includes("a1")) return "A1";

  return "B1"; // default
}

/**
 * Build normalised mark rows from either pulse_layer_2_marks OR legacy mark_N fields.
 */
function buildMarkRows(feedback) {
  // Prefer explicit pulse marks
  if (Array.isArray(feedback.pulse_layer_2_marks) && feedback.pulse_layer_2_marks.length > 0) {
    return feedback.pulse_layer_2_marks.map(m => ({
      notation: m.notation ?? "B1",
      description: m.description ?? m.keyword ?? "",
      earned: !!m.earned,
      note: m.examiner_note ?? m.feedback ?? "",
    }));
  }

  // Fall back to legacy mark_1, mark_2, ... fields
  return Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([key, val]) => ({
      notation: inferNotation(key, feedback),
      description: val?.keyword ?? "",
      earned: !!val?.earned,
      note: val?.feedback ?? "",
    }));
}

// ── Score ring ─────────────────────────────────────────────────────────────
function ScoreRing({ earned, total, subject }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  const size = 68;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const ringHex = theme.ringColor(pct);
  const labelClass = theme.scoreColor(pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={ringHex}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-black tabular-nums leading-none ${labelClass}`}>{earned}</span>
        <span className="text-[10px] text-white/30 font-medium leading-none mt-0.5">/{total}</span>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function PulseSkeleton({ subject }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;
  return (
    <div className="space-y-3 animate-pulse">
      <div className={`rounded-2xl border ${theme.accentBorder} ${theme.accentBg} p-5 space-y-3`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10" />
          <div className="h-3 w-28 bg-white/10 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-white/10 rounded-full" />
        <div className="h-4 w-1/2 bg-white/10 rounded-full" />
      </div>
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-5 rounded bg-white/10" />
            <div className="h-3 flex-1 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LAYER 1: Exam Hack ─────────────────────────────────────────────────────
// Always visible, never collapsible.
// Content priority: pulse_layer_1 → next_step → cambridge_insight
function Layer1({ feedback, subject }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;

  const content =
    feedback.pulse_layer_1?.trim() ||
    feedback.next_step?.trim() ||
    feedback.cambridge_insight?.trim() ||
    null;

  if (!content) return null;

  return (
    <div className={`relative rounded-2xl border ${theme.accentBorder} bg-gradient-to-br ${theme.accentGradient} ${theme.accentGlow} p-5 overflow-hidden`}>
      {/* Ambient orb */}
      <div className={`pointer-events-none absolute -top-6 -right-6 w-28 h-28 rounded-full ${theme.accentBg} blur-2xl`} />

      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-3 relative">
        <div className={`w-7 h-7 rounded-xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center shrink-0`}>
          <Zap className={`w-3.5 h-3.5 ${theme.accent}`} />
        </div>
        <div>
          <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${theme.accent} opacity-60`}>Layer 1</p>
          <p className={`text-[11px] font-bold ${theme.accent} leading-none`}>{theme.label} · {theme.sublabel}</p>
        </div>
      </div>

      {/* Hack content — large, impactful */}
      <p className="text-base font-bold text-white leading-snug relative">
        {content}
      </p>
    </div>
  );
}

// ── LAYER 2: Mark Scheme Breakdown ─────────────────────────────────────────
// Open by default. Enforces Cambridge notation tags.
function Layer2({ feedback, subject }) {
  const [open, setOpen] = useState(true);
  const marks = buildMarkRows(feedback);
  if (marks.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.025] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white/40" />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Layer 2</p>
            <p className="text-xs font-bold text-white">Mark Scheme Breakdown</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/25 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/25 shrink-0" />}
      </button>

      {/* Mark rows */}
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5">
          {marks.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border transition-all ${
                m.earned
                  ? "bg-green-500/[0.07] border-green-500/20"
                  : "bg-red-500/[0.07] border-red-500/20"
              }`}
            >
              {/* Cambridge notation tag */}
              <div className="shrink-0 flex flex-col items-center gap-1 mt-0.5">
                <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border leading-none ${
                  m.earned
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/15 text-red-300 border-red-500/25"
                }`}>
                  {m.notation}
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-widest leading-none ${
                  m.earned ? "text-green-400" : "text-red-400"
                }`}>
                  {m.earned ? "AWARDED" : "MISSED"}
                </span>
              </div>

              {/* Status icon */}
              <div className="shrink-0 mt-0.5">
                {m.earned
                  ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                  : <XCircle className="w-4 h-4 text-red-400/80" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className={`text-xs font-semibold leading-snug ${m.earned ? "text-green-200" : "text-red-200"}`}>
                  {m.description}
                </p>
                {m.note && (
                  <p className="text-[11px] text-white/40 italic leading-relaxed">{m.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LAYER 3: Deep Dive ─────────────────────────────────────────────────────
// Collapsed by default. Uses cambridge_insight as fallback.
function Layer3({ feedback, subject }) {
  const [open, setOpen] = useState(false);
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;

  const content =
    feedback.pulse_layer_3?.trim() ||
    feedback.cambridge_insight?.trim() ||
    null;

  if (!content) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.025] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Microscope className="w-3 h-3 text-white/40" />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Layer 3</p>
            <p className="text-xs font-bold text-white">Deep Dive</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!open && (
            <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${theme.accentPill}`}>
              Expand
            </span>
          )}
          {open
            ? <ChevronUp className="w-4 h-4 text-white/25 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-white/25 shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <p className="text-sm text-white/65 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function PulseFeedback({ feedback, subject = "physics", marksTotal = 1, isStreaming = false }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;

  if (isStreaming && !feedback) {
    return <PulseSkeleton subject={subject} />;
  }

  if (!feedback) return null;

  const marksEarned = feedback.marks_earned ?? 0;
  const pct = marksTotal > 0 ? Math.round((marksEarned / marksTotal) * 100) : 0;

  return (
    <div className="space-y-3">

      {/* ── Score header ── */}
      <div className="flex items-center gap-4 bg-white/[0.03] border border-white/8 rounded-2xl px-4 py-3.5">
        <ScoreRing earned={marksEarned} total={marksTotal} subject={subject} />
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Marks Earned</p>
          <p className={`text-lg font-black tabular-nums ${theme.scoreColor(pct)}`}>
            {marksEarned} <span className="text-sm font-medium text-white/30">/ {marksTotal}</span>
          </p>
          {marksEarned >= marksTotal ? (
            <p className="text-[11px] text-green-400 font-semibold">Full marks ✓</p>
          ) : (
            <p className="text-[11px] text-white/30">{pct}% — keep going</p>
          )}
        </div>
      </div>

      {/* ── Layer 1: Exam Hack (always visible) ── */}
      <Layer1 feedback={feedback} subject={subject} />

      {/* ── Layer 2: Mark Scheme Breakdown (open) ── */}
      <Layer2 feedback={feedback} subject={subject} />

      {/* ── Layer 3: Deep Dive (collapsed) ── */}
      <Layer3 feedback={feedback} subject={subject} />

    </div>
  );
}