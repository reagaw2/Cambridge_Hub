import { ArrowLeft, Flame } from "lucide-react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
      <div className="flex items-center gap-2.5">
        <button className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-mono text-[11px] text-muted-foreground">Day 3 streak</span>
        </div>
      </div>

      <span className="text-sm font-semibold tracking-wide text-foreground">
        CAIE Physics
      </span>

      <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
        9702/44 · May/Jun 2025
      </span>
    </div>
  );
}