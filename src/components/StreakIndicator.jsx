import { Flame } from "lucide-react";

export default function StreakIndicator() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      <Flame className="w-4 h-4 text-orange-400" />
      <span className="text-xs font-medium text-muted-foreground">
        Day 3 streak
      </span>
    </div>
  );
}