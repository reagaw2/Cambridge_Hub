import { useState } from "react";
import { X } from "lucide-react";
import P1TopicBars from "@/components/P1TopicBars";

export default function P1OverviewPanel({
  questions,
  answers,
  currentIdx,
  onJump,
  onClose,
  onClear,
  starredIds,
  notedIds,
}) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-[540px] bg-card border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">Question Overview</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {answeredCount} of {questions.length} answered
              {starredIds.size > 0 && (
                <span className="ml-2 text-amber-400">· {starredIds.size} starred</span>
              )}
              {notedIds.size > 0 && (
                <span className="ml-2 text-green-400">· {notedIds.size} noted</span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Question dots grid */}
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isCurrent = i === currentIdx;
            const isStarred = starredIds.has(q.id);
            const hasNote = notedIds.has(q.id);
            return (
              <button
                key={q.id}
                onClick={() => { onJump(i); onClose(); }}
                title={`Q${q.number}: ${q.topic}`}
                className={`relative w-9 h-9 rounded-lg text-xs font-bold border transition-all hover:scale-105 ${
                  isCurrent
                    ? "ring-2 ring-primary border-primary bg-primary/20 text-primary scale-110"
                    : a?.flagged_as_guess
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : a?.chosen && a?.correct
                        ? "bg-green-500/20 border-green-500/40 text-green-400"
                        : a?.chosen && !a?.correct
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {q.number}
                {isStarred && (
                  <span className="absolute -top-1 -right-1 text-[8px] text-amber-400">★</span>
                )}
                {hasNote && !isStarred && (
                  <span className="absolute -top-1 -right-1 text-[8px] text-green-400">✎</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-500/60 inline-block" /> Correct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500/60 inline-block" /> Incorrect
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/60 inline-block" /> Guess
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-secondary border border-border inline-block" /> Unanswered
          </span>
        </div>

        {/* Topic progress bars — weakest to strongest */}
        <P1TopicBars questions={questions} answers={answers} />

        {/* Clear progress */}
        <button
          onClick={onClear}
          className="w-full py-2.5 rounded-xl border border-red-500/25 text-red-400/70 text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          Clear progress & restart
        </button>
      </div>
    </div>
  );
}