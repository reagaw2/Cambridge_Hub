import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { getReviewBank, resetReviewBankLock } from "@/lib/topicStore";

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

// Route map to navigate directly to a specific question
const QUESTION_ROUTES = {
  "9702-22-W19-Q1a": "/physicalquantities/question",
  // Quantum Physics (new)
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
  // Astrophysics (new)
  "9702-43-W24-Q10a": "/astrophysics/question",
  "9702-42-S24-Q8ai": "/astrophysics/question",
  // Medical Imaging
  "9702-41-S24-Q8d": "/medicalimaging/question",
  // Circular Motion
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
  "9702-22-ON17-Q4a": "/waves/question",
  // Electric Fields (new)
  "9702-23-S17-Q3a": "/electric/question",
  "9702-23-S17-Q3c": "/electric/question",
  "9702-23-W19-Q3a-i": "/electric/question",
  "9702-23-W19-Q3a-ii": "/electric/question",
  "9702-23-W18-Q6a": "/electric/question",
  "9702-21-S18-Q7c": "/electric/question",
  "9702-23-W17-Q5a": "/electric/question",
  "9702-23-W21-Q4f-ii": "/electric/question",
  "9702-22-W17-Q5a": "/electric/question",
  "9702-22-S19-Q6a": "/electric/question",
  "9702-22-S19-Q6b": "/electric/question",
  "9702-21-W18-Q5a": "/electric/question",
  "9702-21-W17-Q6a": "/electric/question",
  "9702-21-W19-Q6a": "/electric/question",
  "9702-22-M19-Q4a": "/electric/question",
  // Nuclear Physics (new)
  "9702-23-W21-Q4f-iii": "/nuclear/question",
  "9702-21-W18-Q5c-ii": "/nuclear/question",
  // Kinematics
  "9702-22-ON19-Q2a": "/kinematics/question",
  "9702-23-ON24-Q1a": "/kinematics/question",
  "9702-21-MJ24-Q2a": "/kinematics/question",
  "9702-23-MJ24-Q2a": "/kinematics/question",
  "9702-21-MJ22-Q1a": "/kinematics/question",
  "9702-22-MJ22-Q3a-v2": "/kinematics/question",
  "9702-23-ON21-Q3a": "/kinematics/question",
  "9702-22-FM24-Q2a": "/kinematics/question",
  "9702-21-MJ25-Q1a": "/kinematics/question",
  "9702-22-ON23-Q1b": "/kinematics/question",
  "9702-22-ON23-Q1ci": "/kinematics/question",
  "9702-22-ON23-Q1cii-dir": "/kinematics/question",
  "9702-22-FM22-Q2a": "/kinematics/question",
  "9702-22-FM22-Q2d": "/kinematics/question",
  "9702-22-MJ22-Q3d": "/kinematics/question",
  "9702-22-MJ22-Q3ei": "/kinematics/question",
  "9702-22-MJ22-Q3eii": "/kinematics/question",
  "9702-21-MJ25-Q1cii": "/kinematics/question",
  // Forces & Equilibrium
  "9702-22-ON19-Q2bi": "/forces/question",
  "9702-23-ON19-Q2c": "/forces/question",
  "9702-22-ON18-Q1e": "/forces/question",
  "9702-23-ON23-Q2b": "/forces/question",
  "9702-21-MJ22-Q1c": "/forces/question",
  "9702-23-MJ22-Q2c": "/forces/question",
  "9702-22-FM21-Q1ci": "/forces/question",
  "9702-22-FM24-Q2ci": "/forces/question",
  "9702-23-MJ21-Q2bi": "/forces/question",
  "9702-21-ON22-Q2ci": "/forces/question",
  "9702-21-ON22-Q2cii": "/forces/question",
  "9702-22-MJ24-Q2ci": "/forces/question",
  "q1": "/question",
  "q2": "/similar-question",
  "q3": "/familiarity-check",
  "w25_44_Q8a": "/nuclear/question",
  "w25_44_Q8bii": "/nuclear/similar-question",
  "w25_44_Q8ci": "/nuclear/familiarity-check",
  "w25_44_Q1a": "/gravitational/q1a",
  "w25_44_Q2ai": "/thermal/question",
  "w25_44_Q3a": "/thermal/q3a",
  "w25_44_Q4a": "/oscillations/question",
  "w25_44_Q4biv": "/oscillations/similar-question",
  "w25_44_Q5a": "/electric/question",
  "w25_44_Q6ai": "/capacitance/question",
  "w25_44_Q6aii": "/capacitance/similar-question",
  "w25_44_Q7a": "/eminduction/question",
  "w25_44_Q9a": "/quantum/question",
  "w25_44_Q10a": "/astrophysics/question",
  "w25_44_Q10b": "/astrophysics/similar-question",
  "9702-41-ALA26-Q1a": "/gravitational/q1a",
  "9702-41-ALA26-Q1bi": "/gravitational/q1bi",
  "9702-41-ALA26-Q2a": "/thermal/q2a",
  "9702-41-ALA26-Q2bi": "/thermal/q2bi",
  "9702-41-ALA26-Q2bii": "/thermal/q2bii",
  "9702-41-ALA26-Q3a": "/thermal/q3a",
  "9702-41-ALA26-Q3bii": "/thermal/q3bii",
  "9702-41-ALA26-Q4a": "/oscillations/q4a",
  "9702-41-ALA26-Q4bii": "/oscillations/q4bii",
  "9702-41-ALA26-Q5a": "/electric/q5a",
  "9702-41-ALA26-Q5b": "/electric/q5b",
  "9702-41-ALA26-Q6a": "/capacitance/q6a",
  "9702-41-ALA26-Q8ai": "/astrophysics/q8ai",
  "9702-41-ALA26-Q11a": "/astrophysics/q11a",
  "9702-41-ALA26-Q9a": "/nuclear/q9a",
  "9702-41-ALA26-Q9cii": "/nuclear/q9cii",
};

function QuestionCard({ q, now, navigate }) {
  const { locked, msRemaining } = getLockStatus(q.locked_until, now);
  const preview = q.question_text?.slice(0, 80) + (q.question_text?.length > 80 ? "…" : "");
  const [lockedMsg, setLockedMsg] = useState(false);

  if (!locked) {
    const route = QUESTION_ROUTES[q.question_id] ?? "/review";
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
            onClick={() => navigate(route)}
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
          This question unlocks in {formatCountdown(msRemaining)}. Spaced repetition helps you remember for longer.
        </p>
      )}
    </div>
  );
}

export default function ReviewBankScreen() {
  const navigate = useNavigate();
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    getReviewBank().then(rb => { setBank(rb); setLoading(false); });
  }, []);

  // Tick every 30s — recalculates lock status and countdown displays reactively
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

  // Sort locked by soonest unlock
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
          <span className="text-base font-bold tracking-wide text-foreground">Review Bank</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {bank.length} question{bank.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4">

          {/* All locked — empty state */}
          {bank.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                No questions in your review bank right now.
              </p>
              <button onClick={() => navigate("/physics")} className="text-sm text-primary hover:brightness-110">
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

          {/* Ready to attempt */}
          {unlocked.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Ready to attempt</p>
              {unlocked.map(q => (
                <QuestionCard key={q.question_id} q={q} now={now} navigate={navigate} />
              ))}
            </div>
          )}

          {/* Waiting */}
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