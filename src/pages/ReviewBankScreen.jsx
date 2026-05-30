import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, AlertTriangle, Download } from "lucide-react";
import { getReviewBank, getGuessReviewBank } from "@/lib/topicStore";
import { generateReviewBankPdf } from "@/lib/generatePdf";
import { useAuth } from "@/lib/AuthContext";

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

const QUESTION_ROUTES = {
  "9702-41-W19-Q2a": "/thermal/question",
  "9702-42-W19-Q2aii": "/thermal/question",
  "9702-43-S21-Q2b": "/thermal/question",
  "9702-41-S24-Q3ai": "/thermal/question",
  "9702-41-S24-Q3aii": "/thermal/question",
  "9702-43-W24-Q3ai": "/thermal/question",
  "9702-43-W24-Q3aii": "/thermal/question",
  "9702-42-W21-Q3ai": "/thermal/question",
  "9702-42-W21-Q3aii": "/thermal/question",
  "9702-43-S23-Q4a": "/thermal/question",
  "9702-43-W23-Q3ai": "/thermal/question",
  "9702-43-W23-Q3d": "/thermal/question",
  "9702-42-W22-Q3a": "/thermal/question",
  "9702-42-M23-Q2bii": "/thermal/question",
  "9702-42-W23-Q8a": "/quantum/question",
  "9702-42-W23-Q8bi": "/quantum/question",
  "9702-42-W23-Q8bii": "/quantum/question",
  "9702-42-S23-Q8a": "/quantum/question",
  "9702-42-M24-Q7ci": "/quantum/question",
  "9702-43-S23-Q7a": "/quantum/question",
  "9702-43-S23-Q7bii": "/quantum/question",
  "9702-43-S23-Q7cii": "/quantum/question",
  "9702-41-S24-Q8bi": "/quantum/question",
  "9702-41-W23-Q8c": "/quantum/question",
  "9702-42-M22-Q8a": "/quantum/question",
  "9702-42-M22-Q8bi": "/quantum/question",
  "9702-42-M22-Q8bii": "/quantum/question",
  "9702-42-M22-Q8biii": "/quantum/question",
  "9702-42-M23-Q7a": "/quantum/question",
  "9702-42-W24-Q9a": "/quantum/question",
  "9702-42-W24-Q9c": "/quantum/question",
  "9702-43-W24-Q10a": "/astrophysics/question",
  "9702-42-S24-Q8ai": "/astrophysics/question",
  "9702-41-S24-Q8d": "/medicalimaging/question",
  "9702-41-S10-Q1a": "/circularmotion/question",
  "9702-43-W10-Q1a-i": "/circularmotion/question",
  "9702-43-W10-Q1a-ii": "/circularmotion/question",
  "9702-41-W14-Q2a-ii": "/circularmotion/question",
  "9702-43-W21-Q1a": "/circularmotion/question",
  "9702-42-W21-Q1a": "/circularmotion/question",
  "9702-42-W21-Q1b-i": "/circularmotion/question",
  "9702-42-W21-Q1b-ii": "/circularmotion/question",
  "9702-42-W21-Q1d": "/circularmotion/question",
  "9702-43-S23-Q2a": "/circularmotion/question",
  "9702-23-S17-Q3a": "/electric/question",
  "9702-23-W18-Q6a": "/electric/question",
  "9702-21-W18-Q5a": "/electric/question",
  "9702-23-W21-Q4f-iii": "/nuclear/question",
  "9702-22-ON19-Q2a": "/kinematics/question",
  "w25_44_Q8a": "/nuclear/question",
  "w25_44_Q1a": "/gravitational/question",
  "w25_44_Q2ai": "/thermal/question",
  "w25_44_Q3a": "/thermal/question",
  "w25_44_Q4a": "/oscillations/question",
  "w25_44_Q5a": "/electric/question",
  "w25_44_Q6ai": "/capacitance/question",
  "w25_44_Q7a": "/eminduction/question",
  "w25_44_Q9a": "/quantum/question",
  "w25_44_Q10a": "/astrophysics/question",
};

function QuestionCard({ q, now, navigate }) {
  const { locked, msRemaining } = getLockStatus(q.locked_until, now);
  const preview = (q.question_text ?? "").slice(0, 90) + ((q.question_text ?? "").length > 90 ? "…" : "");
  const [lockedMsg, setLockedMsg] = useState(false);
  const hasPersistentIssue = !!q.persistent_misunderstanding;

  const content = (
    <>
      {/* Topic + score */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
          locked ? "text-amber-400/80 bg-amber-500/10" : "text-green-400/80 bg-green-500/10"
        }`}>
          {q.topic}
        </span>
        <div className="flex items-center gap-2">
          {hasPersistentIssue && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-2.5 h-2.5" />
              Persistent mistake
            </span>
          )}
          <span className="text-[11px] text-muted-foreground shrink-0">
            {q.first_attempt_score}/{q.total_marks} marks
          </span>
        </div>
      </div>

      {/* Question preview */}
      <p className={`text-sm leading-relaxed ${locked ? "text-muted-foreground/60" : "text-foreground/80"}`}>{preview}</p>

      {/* Lock / attempt */}
      <div className="flex items-center justify-between">
        {locked ? (
          <div className="flex items-center gap-1.5 text-amber-400/80">
            <Lock className="w-3 h-3" />
            <span className="text-[11px] font-medium">{formatCountdown(msRemaining)}</span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground/50">
            {hasPersistentIssue ? "Try a different approach this time" : "Ready to attempt"}
          </span>
        )}
        {!locked && (
          <button
            onClick={() => navigate(QUESTION_ROUTES[q.question_id] ?? "/review")}
            className="text-xs font-semibold text-green-400 hover:brightness-110 transition-all"
          >
            Attempt now →
          </button>
        )}
      </div>

      {lockedMsg && (
        <p className="text-[11px] text-amber-400/70 italic">
          {formatCountdown(msRemaining)}. Spaced repetition helps you remember for longer.
        </p>
      )}
    </>
  );

  return (
    <div
      className={`bg-card border border-l-4 border-border ${
        hasPersistentIssue ? "border-l-red-500/70" : locked ? "border-l-amber-500/60" : "border-l-green-500/70"
      } rounded-xl p-4 space-y-2.5 ${locked ? "cursor-pointer opacity-60" : ""}`}
      onClick={locked ? () => { setLockedMsg(l => !l); } : undefined}
    >
      {content}
    </div>
  );
}

export default function ReviewBankScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bank, setBank] = useState([]);
  const [mcqBank, setMcqBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (bank.length === 0) return;
    setExporting(true);
    await generateReviewBankPdf({ questions: bank, userEmail: user?.email });
    setExporting(false);
  };

  useEffect(() => {
    Promise.all([getReviewBank(), getGuessReviewBank()]).then(([rb, grb]) => {
      setBank(rb);
      setMcqBank(grb);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const unlocked = bank.filter(q => !getLockStatus(q.locked_until, now).locked);
  const locked = bank.filter(q => getLockStatus(q.locked_until, now).locked);
  const sortedLocked = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until));
  const persistentCount = bank.filter(q => q.persistent_misunderstanding).length;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Review Bank</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
              {bank.length} question{bank.length !== 1 ? "s" : ""}
            </span>
            {bank.length > 0 && (
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-md hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {exporting ? "…" : "PDF"}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4">

          {/* Summary cards */}
          {(bank.length > 0 || mcqBank.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/review")}
                disabled={bank.length === 0}
                className={`bg-card border border-border rounded-xl p-4 text-left transition-all ${bank.length > 0 ? "hover:brightness-110 active:scale-[0.98]" : "opacity-40 cursor-default"}`}
              >
                <div className="text-lg mb-1">📝</div>
                <p className="text-xs font-semibold text-foreground">{bank.length > 0 ? `${bank.length} waiting` : "All clear ✓"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Written</p>
                {persistentCount > 0 && (
                  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> {persistentCount} persistent mistake{persistentCount !== 1 ? "s" : ""}
                  </p>
                )}
              </button>
              <button
                onClick={() => navigate("/guess-review-bank")}
                disabled={mcqBank.length === 0}
                className={`bg-card border border-border rounded-xl p-4 text-left transition-all ${mcqBank.length > 0 ? "hover:brightness-110 active:scale-[0.98]" : "opacity-40 cursor-default"}`}
              >
                <div className="text-lg mb-1">☑</div>
                <p className="text-xs font-semibold text-foreground">{mcqBank.length > 0 ? `${mcqBank.length} waiting` : "All clear ✓"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Multiple Choice</p>
              </button>
            </div>
          )}

          {bank.length === 0 && mcqBank.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                No questions in your review bank right now.
              </p>
              <button onClick={() => navigate("/physics")} className="text-sm text-primary hover:brightness-110">
                Back to dashboard
              </button>
            </div>
          )}

          {bank.length > 0 && unlocked.length === 0 && locked.length > 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <Lock className="w-8 h-8 text-amber-400/60" />
              <p className="text-base font-semibold text-foreground leading-relaxed max-w-xs">
                All questions are waiting. Come back when they unlock.
              </p>
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
                <p className="text-xs text-muted-foreground/60 mt-1">Locked to help your brain consolidate the material.</p>
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