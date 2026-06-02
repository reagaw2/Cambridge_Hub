import { useState } from "react";
import { X, Clock, BookOpen, AlertTriangle, Lock } from "lucide-react";
import { isPaperFresh } from "@/lib/p1PaperMode";

export default function P1ModeModal({ paper, onClose, onSelectMode }) {
  const [step, setStep] = useState("select"); // "select" | "warning"
  const fresh = isPaperFresh(paper.id);

  if (step === "warning") {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
        <div className="bg-card border border-amber-500/40 rounded-2xl p-6 space-y-5 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-foreground text-base">Before you begin</p>
              <p className="text-xs text-amber-400 mt-0.5">{paper.label} · Timed Exam Mode</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>Make sure you have a free, uninterrupted block of at least <strong>2 hours</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>Find a <strong>quiet space</strong> where you won't be disturbed for the duration.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 shrink-0 mt-0.5">•</span>
                <span><strong>Exiting, reloading, or closing this tab will automatically submit your paper</strong> with whatever you have answered so far — no exceptions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>The timer runs for <strong>1 hour 30 minutes</strong>. When it reaches zero, your answers are submitted automatically.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 shrink-0 mt-0.5">•</span>
                <span>Once you start in Exam Mode, <strong>this paper will only be available in Practice Mode</strong> in the future.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>Make sure your device is <strong>charged or plugged in</strong> before starting.</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep("select")}
              className="border border-border text-muted-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
            >
              ← Go back
            </button>
            <button
              onClick={() => onSelectMode("exam")}
              className="bg-amber-500 text-black font-bold py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-sm"
            >
              I'm ready — Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground text-base">Choose Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">{paper.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Practice Mode — always available */}
          <button
            onClick={() => onSelectMode("practice")}
            className="w-full text-left bg-primary/8 border border-primary/25 rounded-xl p-4 hover:bg-primary/12 active:scale-[0.99] transition-all space-y-2"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <p className="font-bold text-foreground text-sm">Practice Mode</p>
              {!fresh && (
                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">Previously started</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No time limit. Pause and resume anytime. Get instant AI feedback on each question at your own pace.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">✓ No timer</span>
              <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">✓ Pause anytime</span>
              <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">✓ Save progress</span>
            </div>
          </button>

          {/* Timed Exam Mode — only for fresh papers */}
          {fresh ? (
            <button
              onClick={() => setStep("warning")}
              className="w-full text-left bg-amber-500/8 border border-amber-500/25 rounded-xl p-4 hover:bg-amber-500/12 active:scale-[0.99] transition-all space-y-2"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="font-bold text-foreground text-sm">Timed Exam Mode</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simulates real Cambridge conditions. 1 hour 30 minute countdown. Auto-submits when time runs out or if you exit.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">⏱ 1hr 30min</span>
                <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">✗ No pausing</span>
                <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">✗ Exit = submit</span>
              </div>
            </button>
          ) : (
            /* Locked state — paper already attempted */
            <div className="w-full text-left bg-secondary/40 border border-border/40 rounded-xl p-4 opacity-50 cursor-not-allowed space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="font-bold text-muted-foreground text-sm">Timed Exam Mode</p>
                <span className="ml-auto text-[10px] font-bold text-muted-foreground/60 bg-secondary border border-border/60 px-2 py-0.5 rounded-full">Locked</span>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                This paper has already been attempted in Practice Mode. Exam Mode is only available for papers that have never been started before.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-full">⏱ 1hr 30min</span>
                <span className="text-[10px] font-semibold text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-full">Not available</span>
              </div>
            </div>
          )}
        </div>

        {!fresh && (
          <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed">
            💡 Exam Mode is permanently locked once a paper has been started. Use a different paper for exam simulation.
          </p>
        )}
      </div>
    </div>
  );
}