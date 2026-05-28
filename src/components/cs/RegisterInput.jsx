import { useState } from "react";

export default function RegisterInput({ label, bits = 8, value, onChange }) {
  const cells = Array.from({ length: bits }, (_, i) => value?.[i] ?? "");

  function toggle(i) {
    const next = [...cells];
    next[i] = next[i] === "1" ? "0" : next[i] === "0" ? "" : "0";
    onChange(next.join(""));
  }

  const filled = cells.filter(c => c !== "").length;

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        {cells.map((bit, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`w-9 h-9 rounded-lg border-2 font-mono text-sm font-bold transition-all select-none
              ${bit === "1"
                ? "bg-blue-500/25 border-blue-500/60 text-blue-300"
                : bit === "0"
                  ? "bg-secondary border-border text-foreground"
                  : "bg-card border-border/40 text-muted-foreground/30 hover:border-border hover:text-muted-foreground"
              }`}
          >
            {bit === "" ? "·" : bit}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/50">
        Tap a cell to toggle it: empty → 0 → 1 → 0 · {filled}/{bits} bits filled
      </p>
    </div>
  );
}