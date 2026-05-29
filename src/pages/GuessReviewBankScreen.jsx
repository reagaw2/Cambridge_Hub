import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { getGuessReviewBank } from "@/lib/topicStore";
import { getQuestionsByIds, MCQ_QUESTIONS } from "@/lib/mcqBank";
import PaperPdfButton from "@/components/PaperPdfButton";

const OPTION_KEYS = ["A", "B", "C", "D"];

// Map question source strings → paperId used by PaperPdfButton / p1PaperStore
const SOURCE_TO_PAPER_ID = {
  "9702/12/F/M/25": "9702/12/F/M/25",
  "9702/12/M/J/22": "9702/12/M/J/22",
  "9702/11/M/J/22": "9702/11/M/J/22",
};

function getPaperIdFromSource(source) {
  if (!source) return null;
  if (SOURCE_TO_PAPER_ID[source]) return SOURCE_TO_PAPER_ID[source];
  for (const [key, val] of Object.entries(SOURCE_TO_PAPER_ID)) {
    if (source.includes(key)) return val;
  }
  return null;
}

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

function GuessCard({ entry, mcqData, navigate, onStartSession }) {
  const questionId = entry.question_id;
  const { locked, msRemaining } = getLockStatus(entry.locked_until);
  const q = mcqData[questionId];
  const [lockedMsg, setLockedMsg] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const questionText = q?.text ?? null;
  const topic = q?.topic ?? "MCQ";
  const source = q?.source ?? entry.source ?? null;
  const paperId = getPaperIdFromSource(source);
  const hasOptions = q?.options && Object.keys(q.options).length > 0;

  const borderColor = locked ? "border-l-amber-500/60" : "border-l-green-500/70";

  return (
    <div className={`bg-card border border-l-4 border-border ${borderColor} rounded-xl overflow-hidden${locked ? " opacity-60" : ""}`}>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            locked ? "text-amber-400/80 bg-amber-500/10" : "text-green-400/80 bg-green-500/10"
          }`}>
            {topic}
          </span>
          {source && (
            <span className="text-[10px] text-muted-foreground/50 font-mono">{source}</span>
          )}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Less" : "Full question"}
        </button>
      </div>

      {/* Question text — preview or full */}
      <div className="px-4 pb-3">
        {questionText ? (
          <p className={`text-sm text-foreground/85 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
            {questionText}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/40 italic">Question ID: {questionId}</p>
        )}
      </div>

      {/* Options — only when expanded */}
      {expanded && hasOptions && (
        <div className="px-4 pb-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Options</p>
          {OPTION_KEYS.map(key => {
            const text = q.options[key];
            if (!text) return null;
            return (
              <div key={key} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-secondary/30">
                <span className="font-mono text-xs font-black text-muted-foreground shrink-0 mt-0.5 w-4">{key}</span>
                <span className="text-sm text-foreground/80 leading-relaxed">{text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF button — when expanded and paper known */}
      {expanded && paperId && (
        <div className="px-4 pb-3 flex items-center gap-3">
          <PaperPdfButton label="Open Past Paper" paperId={paperId} />
          <p className="text-[11px] text-muted-foreground/50 leading-snug">
            Open the PDF to see any diagrams for this question
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/30">
        {locked ? (
          <>
            <div
              className="flex items-center gap-1.5 text-amber-400/80 cursor-pointer"
              onClick={() => { setLockedMsg(l => !l); }}
            >
              <Lock className="w-3 h-3" />
              <span className="text-[11px] font-medium">Unlocks in {formatCountdown(msRemaining)}</span>
            </div>
            <span className="text-[11px] text-muted-foreground/40">Guessed · needs review</span>
          </>
        ) : (
          <>
            <span className="text-[11px] text-muted-foreground/50">You guessed this — prove you know it</span>
            <button
              onClick={() => onStartSession(questionId)}
              className="text-xs font-semibold text-green-400 hover:brightness-110 transition-all px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25"
            >
              Attempt now →
            </button>
          </>
        )}
      </div>

      {lockedMsg && (
        <div className="px-4 pb-3">
          <p className="text-[11px] text-amber-400/70 italic">
            A correct guess doesn't mean mastery. This unlocks in {formatCountdown(msRemaining)}.
          </p>
        </div>
      )}
    </div>
  );
}

export default function GuessReviewBankScreen() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [mcqData, setMcqData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuessReviewBank().then(bank => {
      const normalised = bank.map(e =>
        typeof e === "string" ? { question_id: e, locked_until: null } : e
      );
      setEntries(normalised);

      const ids = normalised.map(e => e.question_id);
      const map = {};
      MCQ_QUESTIONS.forEach(q => { map[q.id] = q; });
      getQuestionsByIds(ids).forEach(q => { map[q.id] = q; });
      setMcqData(map);
      setLoading(false);
    });
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

          {entries.length > 0 && unlocked.length === 0 && locked.length > 0 && (
            <div className="flex flex-col items-center justify-center text-center px-8 gap-4 py-8">
              <Lock className="w-8 h-8 text-amber-400/60" />
              <p className="text-base font-semibold text-foreground leading-relaxed max-w-xs">
                All questions are waiting. Come back when they unlock.
              </p>
              {nextUnlock && (
                <p className="text-sm text-amber-400 font-medium">
                  Next unlocks in {formatCountdown(getLockStatus(nextUnlock.locked_until).msRemaining)}
                </p>
              )}
            </div>
          )}

          {unlocked.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Ready to attempt</p>
              {unlocked.map(e => (
                <GuessCard key={e.question_id} entry={e} mcqData={mcqData} navigate={navigate} onStartSession={handleStartSession} />
              ))}
            </div>
          )}

          {sortedLocked.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Waiting — Spaced Repetition Active</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Locked for 12 hours. A correct guess is not mastered knowledge.</p>
              </div>
              {sortedLocked.map(e => (
                <GuessCard key={e.question_id} entry={e} mcqData={mcqData} navigate={navigate} onStartSession={handleStartSession} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}