/**
 * DevQuestionJumper — admin-only tool to load any question by ID.
 * Only renders for reaganmungoma@gmail.com.
 */
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const DEV_EMAIL = "reaganmungoma@gmail.com";

export default function DevQuestionJumper({ onJump, allQuestions }) {
  const { user } = useAuth();
  const [inputId, setInputId] = useState("");
  const [jumpError, setJumpError] = useState(null);

  if (user?.email !== DEV_EMAIL) return null;

  const handleJump = () => {
    const q = allQuestions.find(q => q.id === inputId.trim());
    if (!q) {
      setJumpError(`No question found with ID: "${inputId.trim()}"`);
      return;
    }
    setJumpError(null);
    onJump(q);
  };

  return (
    <div className="mt-6 border-t border-dashed border-border/40 pt-4 space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Dev — Jump to question ID</p>
      <div className="flex gap-2">
        <input
          value={inputId}
          onChange={e => { setInputId(e.target.value); setJumpError(null); }}
          placeholder="e.g. w25_44_Q1a"
          className="flex-1 bg-card border border-border/60 rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40"
          onKeyDown={e => e.key === "Enter" && handleJump()}
        />
        <button
          onClick={handleJump}
          className="text-xs font-mono px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:brightness-110 transition-all"
        >
          Go
        </button>
      </div>
      {jumpError && <p className="text-[11px] text-red-400/70 font-mono">{jumpError}</p>}
    </div>
  );
}