import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { csGetReviewBank, csGetMistakeDna } from "@/lib/csTopicStore";

function getLockStatus(locked_until, now) {
  if (!locked_until) return { locked: false, msRemaining: 0 };
  const ms = new Date(locked_until).getTime() - now;
  return { locked: ms > 0, msRemaining: Math.max(0, ms) };
}

function formatCountdown(ms) {
  if (ms < 60000) return "Unlocking now...";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `Unlocks in ${hours}h ${minutes}m`;
  return `Unlocks in ${minutes}m`;
}

const DNA_CATEGORY_STYLE = {
  "Precision Phrasing Flaw":      { pill: "bg-amber-500/15 border-amber-500/30 text-amber-300",  dot: "bg-amber-400" },
  "Missing Keyword":              { pill: "bg-red-500/15 border-red-500/30 text-red-300",         dot: "bg-red-400" },
  "Conceptual Misunderstanding":  { pill: "bg-purple-500/15 border-purple-500/30 text-purple-300", dot: "bg-purple-400" },
  "Incomplete Definition":        { pill: "bg-orange-500/15 border-orange-500/30 text-orange-300", dot: "bg-orange-400" },
  "Wrong Direction / Sign":       { pill: "bg-rose-500/15 border-rose-500/30 text-rose-300",      dot: "bg-rose-400" },
  "Unit / Notation Error":        { pill: "bg-blue-500/15 border-blue-500/30 text-blue-300",      dot: "bg-blue-400" },
  "Omitted Qualifying Condition": { pill: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",      dot: "bg-cyan-400" },
  "Logical Gap":                  { pill: "bg-slate-500/15 border-slate-500/30 text-slate-300",   dot: "bg-slate-400" },
};

function DnaTag({ category }) {
  const style = DNA_CATEGORY_STYLE[category] ?? { pill: "bg-white/8 border-white/15 text-white/50", dot: "bg-white/40" };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 leading-none ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {category}
    </span>
  );
}

function LastAttemptStrip({ text }) {
  if (!text) return null;
  const display = text.length > 120 ? text.slice(0, 117) + "…" : text;
  return (
    <div className="border-l-2 border-white/10 pl-2.5 py-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
        Your last attempt
      </p>
      <p className="text-[11px] text-muted-foreground/50 italic leading-relaxed break-words">
        "{display}"
      </p>
    </div>
  );
}

function resolveLastAttempt(q, dnaEntries) {
  if (q.first_attempt_answer?.trim()) {
    return q.first_attempt_answer.trim();
  }
  const matching = dnaEntries
    .filter(e => e.question_id === q.question_id && e.student_response?.trim())
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  return matching[0]?.student_response?.trim() ?? null;
}

function QuestionCard({ q, dnaEntries, now, navigate }) {
  const { locked, msRemaining } = getLockStatus(q.locked_until, now);
  const preview = q.question_text?.slice(0, 80) + (q.question_text?.length > 80 ? "…" : "");
  const [lockedMsg, setLockedMsg] = useState(false);

  // ── DIAGNOSTIC: log what DNA entries exist for this question ──────────
  const dnaForQuestion = dnaEntries.filter(e => e.question_id === q.question_id);
  console.log(
    `[CSReviewBank] card="${q.question_id}" | dnaEntries total=${dnaEntries.length} | matches=${dnaForQuestion.length}`,
    dnaForQuestion.length > 0 ? dnaForQuestion : "(none)"
  );

  const uniqueCategories = [...new Set(dnaForQuestion.map(e => e.error_category))].filter(Boolean);
  const lastAttemptText = resolveLastAttempt(q, dnaEntries);

  if (!locked) {
    return (
      <div className="bg-card border border-l-4 border-border border-l-green-500/70 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full">
            {q.topic}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {q.first_attempt_score}/{q.total_marks} marks
          </span>
        </div>

        {/* DNA badges — rendered whenever dnaForQuestion has entries, no subject gate */}
        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {uniqueCategories.map(cat => <DnaTag key={cat} category={cat} />)}
          </div>
        )}

        <p className="text-sm text-foreground/80 leading-relaxed">{preview}</p>
        <LastAttemptStrip text={lastAttemptText} />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">You scored {q.first_attempt_score}/{q.total_marks}</span>
          <button
            onClick={() => navigate("/cs/review-session", { state: { questionId: q.question_id } })}
            className="text-xs font-semibold text-green-400 hover:brightness-110 transition-all"
          >
            Attempt now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-l-4 border-border border-l-amber-500/60 rounded-xl p-4 space-y-2.5 opacity-50 cursor-pointer"
      onClick={() => { setLockedMsg(true); setTimeout(() => setLockedMsg(false), 3000); }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
          {q.topic}
        </span>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {q.first_attempt_score}/{q.total_marks} marks
        </span>
      </div>

      {/* DNA badges — rendered whenever dnaForQuestion has entries, no subject gate */}
      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueCategories.map(cat => <DnaTag key={cat} category={cat} />)}
        </div>
      )}

      <p className="text-sm text-muted-foreground/60 leading-relaxed">{preview}</p>
      <LastAttemptStrip text={lastAttemptText} />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">You scored {q.first_attempt_score}/{q.total_marks}</span>
        <div className="flex items-center gap-1.5 text-amber-400/80">
          <Lock className="w-3 h-3" />
          <span className="text-[11px] font-medium">{formatCountdown(msRemaining)}</span>
        </div>
      </div>

      {lockedMsg && (
        <p className="text-[11px] text-amber-400/70 italic">
          Unlocks in {formatCountdown(msRemaining)}. Spaced repetition helps you remember for longer.
        </p>
      )}
    </div>
  );
}

export default function CSReviewBank() {
  const navigate = useNavigate();
  const [bank, setBank] = useState([]);
  const [dnaEntries, setDnaEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    async function load() {
      const [rb, dna] = await Promise.all([csGetReviewBank(), csGetMistakeDna()]);

      // ── DIAGNOSTIC: confirm what we got from the store ─────────────────
      console.log("[CSReviewBank] review bank entries:", rb.length, rb.map(q => q.question_id));
      console.log("[CSReviewBank] cs_mistake_dna entries:", dna.length, dna);

      setBank(rb);
      setDnaEntries(Array.isArray(dna) ? dna : []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  const unlocked = bank.filter(q => !getLockStatus(q.locked_until, now).locked);
  const locked = bank.filter(q => getLockStatus(q.locked_until, now).locked);
  const sortedLocked = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until));
  const nextUnlock = sortedLocked[0];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CS Review Bank</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {bank.length} question{bank.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4">

          {bank.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                No questions in your CS review bank right now.
              </p>
              <button onClick={() => navigate("/cs")} className="text-sm text-blue-400 hover:brightness-110">
                Back to dashboard
              </button>
            </div>
          )}

          {bank.length > 0 && unlocked.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <Lock className="w-8 h-8 text-amber-400/60" />
              <p className="text-base font-semibold text-foreground leading-relaxed max-w-xs">
                All questions are waiting. Come back when they unlock — your brain is consolidating the material.
              </p>
              {nextUnlock && (
                <p className="text-sm text-amber-400 font-medium">
                  {formatCountdown(getLockStatus(nextUnlock.locked_until, now).msRemaining)}
                </p>
              )}
            </div>
          )}

          {unlocked.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Ready to attempt</p>
              {unlocked.map(q => (
                <QuestionCard key={q.question_id} q={q} dnaEntries={dnaEntries} now={now} navigate={navigate} />
              ))}
            </div>
          )}

          {sortedLocked.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Waiting — Spaced Repetition Active</p>
                <p className="text-xs text-muted-foreground/60 mt-1">These questions are locked to help your brain consolidate the material.</p>
              </div>
              {sortedLocked.map(q => (
                <QuestionCard key={q.question_id} q={q} dnaEntries={dnaEntries} now={now} navigate={navigate} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}