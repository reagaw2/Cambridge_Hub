/**
 * PulseFeedback — 3-Layer Pulse Answer Engine feedback display.
 *
 * Props:
 *   feedback  — the full parsed feedback object from Claude
 *   subject   — "physics" | "cs" | "math"
 *   marksTotal — number
 *   isStreaming — bool (shows skeleton pulse while streaming)
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Zap, BookOpen, Microscope, CheckCircle2, XCircle } from "lucide-react";

const SUBJECT_THEME = {
  physics: {
    accent: "text-cyan-400",
    accentBg: "bg-cyan-400/10",
    accentBorder: "border-cyan-400/30",
    accentGlow: "shadow-[0_0_24px_rgba(34,211,238,0.18)]",
    accentGradient: "from-cyan-400/20 to-blue-500/5",
    label: "Physics Hack",
    scoreColor: (pct) => pct >= 80 ? "text-cyan-400" : pct >= 50 ? "text-amber-400" : "text-red-400",
  },
  cs: {
    accent: "text-violet-400",
    accentBg: "bg-violet-400/10",
    accentBorder: "border-violet-400/30",
    accentGlow: "shadow-[0_0_24px_rgba(167,139,250,0.18)]",
    accentGradient: "from-violet-400/20 to-purple-500/5",
    label: "CS Hack",
    scoreColor: (pct) => pct >= 80 ? "text-violet-400" : pct >= 50 ? "text-amber-400" : "text-red-400",
  },
  math: {
    accent: "text-emerald-400",
    accentBg: "bg-emerald-400/10",
    accentBorder: "border-emerald-400/30",
    accentGlow: "shadow-[0_0_24px_rgba(52,211,153,0.18)]",
    accentGradient: "from-emerald-400/20 to-green-500/5",
    label: "Maths Hack",
    scoreColor: (pct) => pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400",
  },
};

// ─── Skeleton shimmer ──────────────────────────────────────────────────────
function PulseSkeleton({ subject = "physics" }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;
  return (
    <div className="space-y-3 animate-pulse">
      <div className={`rounded-2xl border ${theme.accentBorder} ${theme.accentBg} p-5 space-y-3`}>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full ${theme.accentBg}`} />
          <div className="h-3 w-24 bg-white/10 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-white/10 rounded-full" />
        <div className="h-5 w-1/2 bg-white/10 rounded-full" />
      </div>
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-white/10" />
            <div className="h-3 flex-1 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Score ring ────────────────────────────────────────────────────────────
function ScoreRing({ earned, total, subject }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  const size = 72;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const scoreColorClass = theme.scoreColor(pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor"
          className={scoreColorClass}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-black tabular-nums leading-none ${scoreColorClass}`}>{earned}</span>
        <span className="text-[10px] text-white/30 font-medium">/{total}</span>
      </div>
    </div>
  );
}

// ─── Layer 2: Mark breakdown ───────────────────────────────────────────────
function Layer2({ feedback, subject }) {
  const [open, setOpen] = useState(true);
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;

  // Support both pulse_layer_2_marks array AND legacy mark_1/mark_2/... fields
  const pulseMarks = feedback.pulse_layer_2_marks;
  const legacyMarks = Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([, v]) => v);

  const hasMarks = (pulseMarks?.length > 0) || legacyMarks.length > 0;
  if (!hasMarks) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Layer 2</p>
            <p className="text-sm font-semibold text-white">Mark Scheme Breakdown</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/30 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2.5 border-t border-white/5 pt-4">
          {pulseMarks?.length > 0 ? (
            pulseMarks.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm leading-relaxed ${
                  m.earned
                    ? "bg-green-500/8 border-green-500/20 text-green-200"
                    : "bg-red-500/8 border-red-500/20 text-red-200"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {m.earned
                    ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.earned ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                    }`}>{m.notation}</span>
                    <span className="text-xs text-white/60">{m.description}</span>
                  </div>
                  {m.examiner_note && (
                    <p className="text-[11px] text-white/40 italic leading-relaxed">{m.examiner_note}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Legacy mark format
            legacyMarks.map((mark, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                  mark.earned
                    ? "bg-green-500/8 border-green-500/20"
                    : "bg-red-500/8 border-red-500/20"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {mark.earned
                    ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <p className={`text-xs font-semibold font-mono ${mark.earned ? "text-green-300" : "text-red-300"}`}>
                    {mark.keyword}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">{mark.feedback}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Layer 3: Deep dive ────────────────────────────────────────────────────
function Layer3({ text, subject }) {
  const [open, setOpen] = useState(false);
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;

  // Fallback to cambridge_insight if no pulse_layer_3
  const content = text || null;
  if (!content) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Microscope className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Layer 3</p>
            <p className="text-sm font-semibold text-white">Deep Dive</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!open && (
            <span className={`text-[10px] font-semibold ${theme.accent} ${theme.accentBg} border ${theme.accentBorder} px-2 py-0.5 rounded-full`}>
              Expand
            </span>
          )}
          {open
            ? <ChevronUp className="w-4 h-4 text-white/30 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <p className="text-sm text-white/70 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export default function PulseFeedback({ feedback, subject = "physics", marksTotal = 1, isStreaming = false }) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;

  if (isStreaming && !feedback) {
    return <PulseSkeleton subject={subject} />;
  }

  if (!feedback) return null;

  const marksEarned = feedback.marks_earned ?? 0;
  const layer1 = feedback.pulse_layer_1;
  const layer3 = feedback.pulse_layer_3 || feedback.cambridge_insight;
  const nextStep = feedback.next_step;

  return (
    <div className="space-y-3">

      {/* Score header */}
      <div className="flex items-center gap-4 bg-white/[0.03] border border-white/8 rounded-2xl p-4">
        <ScoreRing earned={marksEarned} total={marksTotal} subject={subject} />
        <div className="space-y-1 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Marks Earned</p>
          <p className="text-white font-semibold text-sm">
            {marksEarned} out of {marksTotal}
          </p>
          {marksEarned >= marksTotal && (
            <p className="text-[11px] text-green-400 font-semibold">Full marks ✓</p>
          )}
        </div>
      </div>

      {/* Layer 1 — Exam Hack (always visible, high impact) */}
      {layer1 && (
        <div className={`relative rounded-2xl border ${theme.accentBorder} bg-gradient-to-br ${theme.accentGradient} ${theme.accentGlow} p-5 space-y-3 backdrop-blur-sm overflow-hidden`}>
          {/* Glow orb */}
          <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${theme.accentBg} blur-2xl pointer-events-none`} />

          <div className="flex items-center gap-2 relative">
            <div className={`w-6 h-6 rounded-lg ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}>
              <Zap className={`w-3 h-3 ${theme.accent}`} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${theme.accent} opacity-70`}>Layer 1</p>
              <p className={`text-[10px] font-bold ${theme.accent}`}>{theme.label}</p>
            </div>
          </div>

          <p className={`text-lg font-bold leading-snug text-white relative`}>
            {layer1}
          </p>
        </div>
      )}

      {/* Layer 2 — Mark Scheme Breakdown (open by default) */}
      <Layer2 feedback={feedback} subject={subject} />

      {/* Layer 3 — Deep Dive (collapsed by default) */}
      <Layer3 text={layer3} subject={subject} />

      {/* Next Step */}
      {nextStep && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Next Step</p>
          <p className="text-sm text-white/70 leading-relaxed font-medium">{nextStep}</p>
        </div>
      )}
    </div>
  );
}