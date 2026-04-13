import { useState } from "react";

export default function AnswerInput({ value, onChange }) {
  const maxChars = 800;

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here — use Cambridge language"
        rows={5}
        maxLength={maxChars}
        className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      />
      <span className="absolute bottom-3 right-4 font-mono text-[11px] text-muted-foreground/50">
        {value.length}/{maxChars}
      </span>
    </div>
  );
}