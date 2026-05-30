import { ArrowLeft, Calculator, BookOpen, NotebookPen, Grid3X3 } from "lucide-react";

/**
 * QuestionSessionHeader
 *
 * Props:
 *   paperRef          string
 *   subject           "Physics" | "Computer Science"
 *   currentIdx        number
 *   total             number
 *   allQuestions      array of {id, topic?}
 *   sessionAnswers    { [questionId]: "correct" | "wrong" }
 *   onBack            () => void
 *   onJumpTo          (idx) => void
 *   notesCount        number — badge
 *   onNotesPanel      () => void — opens the full notes/workings panel
 *   showCalculator    boolean — Physics only
 *   calcActive        boolean
 *   onCalcToggle      () => void
 *   onFormulaSheet    () => void — Physics only
 *   onOverview        () => void (optional)
 */
export default function QuestionSessionHeader({
  paperRef,
  subject = "Physics",
  currentIdx = 0,
  total = 1,
  allQuestions = [],
  sessionAnswers = {},
  onBack,
  onJumpTo,
  notesCount = 0,
  onNotesPanel,
  showCalculator = false,
  calcActive = false,
  onCalcToggle,
  onFormulaSheet,
  onOverview,
}) {
  const answeredCount = Object.keys(sessionAnswers).length;
  const progress = total > 0 ? answeredCount / total : 0;
  const accentColor = subject === "Computer Science" ? "bg-blue-400" : "bg-primary";

  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-2">
        {/* Back */}
        <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>

        {/* Paper info */}
        <div className="flex flex-col items-center min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{paperRef}</p>
          <p className="text-[10px] text-muted-foreground">Q{currentIdx + 1} of {total}</p>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Calculator — Physics only */}
          {showCalculator && onCalcToggle && (
            <button
              onClick={onCalcToggle}
              title="Scientific Calculator"
              className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
                calcActive
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-secondary border-border text-muted-foreground hover:brightness-110"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Formula sheet — Physics only */}
          {onFormulaSheet && (
            <button
              onClick={onFormulaSheet}
              title="Data / Formula Sheet"
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-border bg-secondary text-muted-foreground hover:brightness-110 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Notes / Workings panel */}
          {onNotesPanel && (
            <button
              onClick={onNotesPanel}
              title="Notes, Workings & Starred"
              className={`relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
                notesCount > 0
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-secondary border-border text-muted-foreground hover:brightness-110"
              }`}
            >
              <NotebookPen className="w-3.5 h-3.5" />
              {notesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                  {notesCount}
                </span>
              )}
            </button>
          )}

          {/* Overview grid */}
          {onOverview && (
            <button
              onClick={onOverview}
              title="Question overview"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-muted-foreground hover:brightness-110 transition-all text-[10px] font-bold"
            >
              <Grid3X3 className="w-3 h-3" />
              {answeredCount}/{total}
            </button>
          )}
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="w-full h-0.5 bg-secondary">
        <div
          className={`h-0.5 ${accentColor} transition-all duration-500`}
          style={{ width: `${Math.max(progress * 100, currentIdx > 0 ? 2 : 0)}%` }}
        />
      </div>

      {/* ── Question dots ─────────────────────────────────────────────────── */}
      {allQuestions.length > 1 && (
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none">
          {allQuestions.map((q, i) => {
            const status = sessionAnswers[q.id ?? String(i)];
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id ?? i}
                onClick={() => onJumpTo?.(i)}
                title={`Q${i + 1}${q.topic ? ": " + q.topic : ""}`}
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all active:scale-95 ${
                  isCurrent
                    ? "ring-2 ring-primary bg-primary/20 text-primary scale-110"
                    : status === "correct"
                      ? "bg-green-500 text-white"
                      : status === "wrong"
                        ? "bg-red-500 text-white"
                        : "bg-secondary/60 text-muted-foreground/50 border border-border/30 hover:bg-secondary"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}