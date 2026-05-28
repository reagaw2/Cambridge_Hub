import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Download, ChevronDown, X } from "lucide-react";
import { getReviewBank, getGuessReviewBank, resetReviewBankLock } from "@/lib/topicStore";
import { generateReviewBankPdf } from "@/lib/generatePdf";
import { getMistakeDna } from "@/lib/topicStore";
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

// Route map to navigate directly to a specific question
const QUESTION_ROUTES = {
  "9702-22-W19-Q1a": "/physicalquantities/question",
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
  "9702-22-ON17-Q4a": "/waves/question",
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
  "9702-23-W21-Q4f-iii": "/nuclear/question",
  "9702-21-W18-Q5c-ii": "/nuclear/question",
  "9702-22-ON19-Q2a": "/kinematics/question",
  "9702-22-ON19-Q2bi": "/forces/question",
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

// Styling config per error category
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

const ALL_CATEGORIES = Object.keys(DNA_CATEGORY_STYLE);

function DnaTag({ category }) {
  const style = DNA_CATEGORY_STYLE[category] ?? { pill: "bg-white/8 border-white/15 text-white/50", dot: "bg-white/40" };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 leading-none ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {category}
    </span>
  );
}

function QuestionCard({ q, dnaEntries, now, navigate }) {
  const { locked, msRemaining } = getLockStatus(q.locked_until, now);
  const preview = q.question_text?.slice(0, 80) + (q.question_text?.length > 80 ? "…" : "");
  const [lockedMsg, setLockedMsg] = useState(false);

  // Get unique error categories for this question from the DNA store
  const dnaForQuestion = dnaEntries.filter(e => e.question_id === q.question_id);
  const uniqueCategories = [...new Set(dnaForQuestion.map(e => e.error_category))].filter(Boolean);

  if (!locked) {
    const route = QUESTION_ROUTES[q.question_id] ?? "/review";
    return (
      <div className="bg-card border border-l-4 border-border border-l-green-500/70 rounded-xl p-4 space-y-2.5">
        {/* Header row: topic + lock status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full">
            {q.topic}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {q.first_attempt_score}/{q.total_marks} marks
          </span>
        </div>

        {/* DNA tags */}
        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {uniqueCategories.map(cat => <DnaTag key={cat} category={cat} />)}
          </div>
        )}

        <p className="text-sm text-foreground/80 leading-relaxed">{preview}</p>

        <div className="flex justify-end">
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

      {/* DNA tags (dimmed when locked) */}
      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueCategories.map(cat => <DnaTag key={cat} category={cat} />)}
        </div>
      )}

      <p className="text-sm text-muted-foreground/60 leading-relaxed">{preview}</p>

      <div className="flex items-center justify-between">
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

export default function ReviewBankScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bank, setBank] = useState([]);
  const [mcqBank, setMcqBank] = useState([]);
  const [dnaEntries, setDnaEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [exporting, setExporting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const handleExportPdf = async () => {
    if (bank.length === 0) return;
    setExporting(true);
    await generateReviewBankPdf({ questions: bank, userEmail: user?.email });
    setExporting(false);
  };

  useEffect(() => {
    Promise.all([getReviewBank(), getGuessReviewBank(), getMistakeDna()]).then(([rb, grb, dna]) => {
      setBank(rb);
      setMcqBank(grb);
      setDnaEntries(Array.isArray(dna) ? dna : []);
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

  // ── Filtering ────────────────────────────────────────────────────────────

  // Collect all categories that actually appear in this student's DNA
  const presentCategories = [...new Set(dnaEntries.map(e => e.error_category).filter(Boolean))].sort();

  function questionMatchesFilter(q) {
    if (activeFilter === "all") return true;
    return dnaEntries.some(e => e.question_id === q.question_id && e.error_category === activeFilter);
  }

  const unlocked = bank.filter(q => !getLockStatus(q.locked_until, now).locked && questionMatchesFilter(q));
  const locked = bank.filter(q => getLockStatus(q.locked_until, now).locked && questionMatchesFilter(q));
  const sortedLocked = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until));
  const nextUnlock = sortedLocked[0];

  const filteredTotal = unlocked.length + locked.length;
  const filterLabel = activeFilter === "all" ? "All error types" : activeFilter;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
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

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* Two bank cards at top */}
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

          {/* ── DNA Filter Row ── */}
          {bank.length > 0 && presentCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Filter by error type
                </p>
                {activeFilter !== "all" && (
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear filter
                  </button>
                )}
              </div>

              {/* Custom dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(o => !o)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    activeFilter !== "all"
                      ? `${DNA_CATEGORY_STYLE[activeFilter]?.pill ?? "bg-white/8 border-white/15 text-white/50"}`
                      : "bg-card border-border text-foreground hover:brightness-110"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {activeFilter !== "all" && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${DNA_CATEGORY_STYLE[activeFilter]?.dot ?? "bg-white/40"}`} />
                    )}
                    <span className="truncate">{filterLabel}</span>
                    {activeFilter !== "all" && filteredTotal > 0 && (
                      <span className="font-mono text-[10px] opacity-70 shrink-0">({filteredTotal})</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                </button>

                {filterOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
                    {/* All option */}
                    <button
                      onClick={() => { setActiveFilter("all"); setFilterOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-secondary transition-all border-b border-border/50 ${
                        activeFilter === "all" ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                      All error types
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{bank.length}</span>
                    </button>

                    {/* Category options — only show ones that exist in this student's DNA */}
                    {presentCategories.map(cat => {
                      const style = DNA_CATEGORY_STYLE[cat] ?? { dot: "bg-white/40" };
                      const count = bank.filter(q =>
                        dnaEntries.some(e => e.question_id === q.question_id && e.error_category === cat)
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={cat}
                          onClick={() => { setActiveFilter(cat); setFilterOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-secondary transition-all border-b border-border/30 last:border-0 ${
                            activeFilter === cat ? "text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                          {cat}
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active filter info */}
              {activeFilter !== "all" && (
                <p className="text-[11px] text-muted-foreground/60 px-1">
                  Showing {filteredTotal} question{filteredTotal !== 1 ? "s" : ""} with <span className="text-foreground/80 font-medium">{activeFilter}</span> errors
                </p>
              )}
            </div>
          )}

          {/* Empty states */}
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

          {bank.length > 0 && unlocked.length === 0 && locked.length === 0 && activeFilter !== "all" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
              <p className="text-base font-semibold text-foreground leading-relaxed">
                No questions match this filter.
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-sm text-primary hover:brightness-110"
              >
                Show all questions
              </button>
            </div>
          )}

          {bank.length > 0 && unlocked.length === 0 && locked.length > 0 && (
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
                <QuestionCard key={q.question_id} q={q} dnaEntries={dnaEntries} now={now} navigate={navigate} />
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
                <QuestionCard key={q.question_id} q={q} dnaEntries={dnaEntries} now={now} navigate={navigate} />
              ))}
            </div>
          )}

          {/* Close dropdown on outside click */}
          {filterOpen && (
            <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
          )}

        </div>
      </div>
    </div>
  );
}