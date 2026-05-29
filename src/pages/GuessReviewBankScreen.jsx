import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { getGuessReviewBank } from "@/lib/topicStore";
import { getQuestionsByIds, MCQ_QUESTIONS } from "@/lib/mcqBank";

function getLockStatus(locked_until) {
  if (!locked_until) return { locked: false, msRemaining: 0 };
  const ms = new Date(locked_until).getTime() - Date.now();
  return { locked: ms > 0, msRemaining: Math.max(0, ms) };
}

function formatCountdown(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function GuessCard({ entry, mcqData, now, navigate, onStartSession }) {
  const questionId = entry.question_id;
  const { locked, msRemaining } = getLockStatus(entry.locked_until);
  const q = mcqData[questionId];
  const [lockedMsg, setLockedMsg] = useState(false);

  // Guard against question not found in bank
  const questionText = q?.text ?? "";
  const preview = questionText
    ? (questionText.slice(0, 80) + (questionText.length > 80 ? "…" : ""))
    : `Question ID: ${questionId}`;
  const topic = q?.topic ?? "MCQ";

  if (!locked) {
    return (
      <div className="bg-card border border-l-4 border-border border-l-green-500/70 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full">
            {topic}
          </span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{preview}</p>
        <div className="flex items-center justify-end">
          <button
            onClick={() => onStartSession(questionId)}
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
          {topic}
        </span>
      </div>
      <p className="text-sm text-muted-foreground/60 leading-relaxed">{preview}</p>
      <div className="flex items-center justify-end gap-1.5 text-amber-400/80">
        <Lock className="w-3 h-3" />
        <span className="text-[11px] font-medium">Unlocks in {formatCountdown(msRemaining)}</span>
      </div>
      {lockedMsg && (
        <p className="text-[11px] text-amber-400/70 italic">
          This question unlocks in {formatCountdown(msRemaining)}. A correct guess is not mastered knowledge.
        </p>
      )}
    </div>
  );
}

export default function GuessReviewBankScreen() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [mcqData, setMcqData] = useState({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    getGuessReviewBank().then(bank => {
      // Normalise legacy string entries
      const normalised = bank.map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
      setEntries(normalised);

      const ids = normalised.map(e => e.question_id);

      // Build lookup from ALL MCQ questions (not just filtered result)
      // This ensures we find questions even if getQuestionsByIds doesn't cover them
      const map = {};
      MCQ_QUESTIONS.forEach(q => { map[q.id] = q; });
      // Also overlay any matches from getQuestionsByIds for completeness
      getQuestionsByIds(ids).forEach(q => { map[q.id] = q; });
      setMcqData(map);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  function handleStartSession(questionId) {
    const unlockedIds = entries
      .filter(e => !getLockStatus(e.locked_until).locked)
      .map(e => e.question_id);
    navigate("/mcq", {
      state: { topic: null, guessReviewMode: true, guessReviewBank: unlockedIds, sessionIndex: 0 }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const unlocked = entries.filter(e => !getLockStatus(e.locked_until).locked);
  const locked = entries.filter(e => getLockStatus(e.locked_until).locked);
  const sortedLocked = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until));
  const nextUnlock = sortedLocked[0];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Guess Review Bank</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {entries.length} question{entries.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4">

          {entries.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                No guesses in your review bank.
              </p>
              <button onClick={() => navigate("/physics")} className="text-sm text-primary hover:brightness-110">
                Back to dashboard
              </button>
            </div>
          )}

          {entries.length > 0 && unlocked.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <Lock className="w-8 h-8 text-amber-400/60" />
              <p className="text-base font-semibold text-foreground leading-relaxed max-w-xs">
                All questions are waiting. Come back when they unlock — your brain is consolidating the material.
              </p>
              {nextUnlock && (
                <p className="text-sm text-amber-400 font-medium">
                  Next question unlocks in {formatCountdown(getLockStatus(nextUnlock.locked_until).msRemaining)}
                </p>
              )}
            </div>
          )}

          {/* Ready to attempt */}
          {unlocked.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Ready to attempt</p>
              {unlocked.map(e => (
                <GuessCard key={e.question_id} entry={e} mcqData={mcqData} now={now} navigate={navigate} onStartSession={handleStartSession} />
              ))}
            </div>
          )}

          {/* Waiting */}
          {sortedLocked.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Waiting — Spaced Repetition Active</p>
                <p className="text-xs text-muted-foreground/60 mt-1">These questions are locked for 12 hours. A correct guess is not mastered knowledge.</p>
              </div>
              {sortedLocked.map(e => (
                <GuessCard key={e.question_id} entry={e} mcqData={mcqData} now={now} navigate={navigate} onStartSession={handleStartSession} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}