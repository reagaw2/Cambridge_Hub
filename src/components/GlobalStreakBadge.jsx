/**
 * GlobalStreakBadge — displays the global daily streak counter.
 * Shows warning state (amber) if it's after 4 PM and the student
 * hasn't answered 3 questions today.
 */
import { Flame, Shield } from "lucide-react";
import { toDateString } from "@/lib/topicStore";

export default function GlobalStreakBadge({ streakData }) {
  if (!streakData) return null;

  const { global_streak, rest_day_passes, daily_question_count, global_streak_last_date } = streakData;
  const today = toDateString(new Date());
  const todayCount = (daily_question_count?.date === today) ? (daily_question_count?.count ?? 0) : 0;
  const hour = new Date().getHours();

  // Warning: after 4 PM, streak > 0, haven't answered 3 questions today
  const isWarning = hour >= 16 && global_streak > 0 && todayCount < 3;
  const streakColor = isWarning ? "text-amber-400" : "text-yellow-400";
  const flameColor = isWarning ? "text-amber-400" : "text-yellow-400";

  if (global_streak === 0 && todayCount === 0) return null;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Flame className={`w-5 h-5 ${flameColor}`} />
          <span className={`text-xl font-bold font-mono ${streakColor}`}>
            {global_streak}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            day{global_streak !== 1 ? "s" : ""}
          </span>
        </div>
        {rest_day_passes > 0 && (
          <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-0.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400">1 Rest Day saved</span>
          </div>
        )}
      </div>
      {isWarning && (
        <p className="text-[11px] text-amber-400/80 font-medium text-center">
          Answer {Math.max(0, 3 - todayCount)} more question{(3 - todayCount) !== 1 ? "s" : ""} to keep your streak alive
        </p>
      )}
      {!isWarning && todayCount >= 3 && (
        <p className="text-[10px] text-green-400/70 font-medium">Streak secured today ✓</p>
      )}
    </div>
  );
}