import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { csGetReviewBank } from "@/lib/csTopicStore";

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

function QuestionCard({ q, now, navigate }) {
  const { locked, msRemaining } = getLockStatus(q.locked_until, now);
  const preview = q.question_text?.slice(0, 80) + (q.question_text?.length > 80 ? "…" : "");
  const [lockedMsg, setLockedMsg] = useState(false);

  if (!locked) {
    return (
      <div className="bg-card border border-l-4 border-border border-l-green-500/70 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full">
            {q.topic}
          </span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{preview}</p>
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
      className="bg-card border border-l-4 border-border border-l-amber-500/60 rounded-xl p-4 space-y-3 opacity-50 cursor-pointer"
      onClick={() => { setLockedMsg(true); setTimeout(() => setLockedMsg(false), 3000); }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
          {q.topic}
        </span>
      </div>
      <p className="text-sm text-muted-foreground/60 leading-relaxed">{preview}</p>
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
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    csGetReviewBank().then(rb => { setBank(rb); setLoading(false); });
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
                <QuestionCard key={q.question_id} q={q} now={now} navigate={navigate} />
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
                <QuestionCard key={q.question_id} q={q} now={now} navigate={navigate} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}