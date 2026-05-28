import { useState } from "react";
import { X } from "lucide-react";

export default function MatchingInput({ leftItems, rightItems, leftLabel = "Left", rightLabel = "Right", value = [], onChange }) {
  const [selectedLeft, setSelectedLeft] = useState(null);

  function handleLeftClick(i) {
    setSelectedLeft(selectedLeft === i ? null : i);
  }

  function handleRightClick(j) {
    if (selectedLeft === null) return;
    // Remove existing connection from this left item (one-to-one)
    const filtered = value.filter(m => m.from !== selectedLeft);
    onChange([...filtered, { from: selectedLeft, to: j }]);
    setSelectedLeft(null);
  }

  function removeMatch(from, to) {
    onChange(value.filter(m => !(m.from === from && m.to === to)));
  }

  function getConnectionFor(leftIdx) {
    return value.find(m => m.from === leftIdx);
  }

  function isRightConnected(rightIdx) {
    return value.some(m => m.to === rightIdx);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{leftLabel}</p>
          {leftItems.map((item, i) => {
            const conn = getConnectionFor(i);
            const isSelected = selectedLeft === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleLeftClick(i)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium leading-snug transition-all ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300 ring-1 ring-blue-500/30"
                    : conn
                      ? "bg-green-500/10 border-green-500/30 text-green-300"
                      : "bg-card border-border text-foreground hover:border-blue-500/30 hover:bg-blue-500/5"
                }`}
              >
                {item}
                {conn && (
                  <span className="block text-[10px] text-green-400/70 mt-0.5">→ {rightItems[conn.to]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{rightLabel}</p>
          {rightItems.map((item, j) => {
            const connected = isRightConnected(j);
            const isTarget = selectedLeft !== null;
            return (
              <button
                key={j}
                type="button"
                onClick={() => handleRightClick(j)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium leading-snug transition-all ${
                  connected
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : isTarget
                      ? "bg-card border-blue-500/30 text-foreground hover:bg-blue-500/10 hover:border-blue-500/50"
                      : "bg-card border-border text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection summary */}
      {value.length > 0 && (
        <div className="bg-secondary/40 border border-border rounded-xl p-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Your connections ({value.length})
          </p>
          {value.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <p className="text-xs text-foreground/80">
                <span className="text-blue-300 font-medium">{leftItems[m.from]}</span>
                <span className="text-muted-foreground mx-1.5">→</span>
                <span className="text-green-300 font-medium">{rightItems[m.to]}</span>
              </p>
              <button
                type="button"
                onClick={() => removeMatch(m.from, m.to)}
                className="p-0.5 rounded text-muted-foreground/40 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedLeft !== null && (
        <p className="text-[11px] text-blue-400/70 text-center animate-pulse">
          Now click a right item to connect it to <strong>{leftItems[selectedLeft]}</strong>
        </p>
      )}
    </div>
  );
}