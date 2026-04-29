/**
 * MockOverviewPanel — collapsible question grid showing answered/flagged/empty states.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MockOverviewPanel({ questions, answers, currentIdx, onJump }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:brightness-105 transition-all text-sm font-semibold text-foreground"
      >
        <span>Question Overview</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground">
            {answers.filter(a => a.answer_text?.trim()).length}/{questions.length} answered
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="p-3 bg-card/50 border-t border-border/50">
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => {
              const a = answers[i];
              const answered = a?.answer_text?.trim();
              const flagged = a?.flagged;
              const isCurrent = i === currentIdx;

              return (
                <button
                  key={i}
                  onClick={() => { onJump(i); setOpen(false); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all hover:brightness-110 ${
                    isCurrent
                      ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                      : flagged
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : answered
                          ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                          : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {q.question_number ?? i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/60 inline-block" />Answered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/60 inline-block" />Flagged</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-secondary inline-block border border-border" />Empty</span>
          </div>
        </div>
      )}
    </div>
  );
}