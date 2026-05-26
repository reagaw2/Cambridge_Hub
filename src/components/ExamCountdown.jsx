/**
 * ExamCountdown — horizontal grid of upcoming Canvas exam cards.
 * Data comes from /api/canvas (Nitro server route).
 */
import { useEffect, useState, useCallback } from "react";
import { loadExamCountdown, fetchExamEvents, daysUntil } from "@/lib/examCountdownStore";
import { CalendarDays, Clock, FileText, FlaskConical, RefreshCw, AlertCircle } from "lucide-react";

const TYPE_CONFIG = {
  Exam: {
    icon: FileText,
    accent: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.25)]",
    border: "border-cyan-500/30",
    bg: "from-cyan-500/10 to-blue-600/5",
    text: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  "Internal Test": {
    icon: FlaskConical,
    accent: "from-violet-500 to-purple-600",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    border: "border-violet-500/30",
    bg: "from-violet-500/10 to-purple-600/5",
    text: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  Assignment: {
    icon: Clock,
    accent: "from-amber-500 to-orange-600",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    border: "border-amber-500/30",
    bg: "from-amber-500/10 to-orange-600/5",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
};

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CountdownCard({ event }) {
  const days = daysUntil(event.due_date);
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG["Assignment"];
  const Icon = cfg.icon;

  const isPast = days !== null && days < 0;
  const isToday = days === 0;
  const isUrgent = days !== null && days <= 3 && days >= 0;

  const urgentColor = isPast
    ? "text-white/30"
    : isToday
      ? "text-red-400"
      : isUrgent
        ? "text-orange-400"
        : cfg.text;

  const displayDays = Math.abs(days ?? 0);
  const daysLabel = isPast
    ? `day${displayDays !== 1 ? "s" : ""} ago`
    : isToday
      ? ""
      : `day${displayDays !== 1 ? "s" : ""}`;

  return (
    <div
      className={`
        relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl border
        ${isPast ? "border-white/8 opacity-50" : cfg.border}
        bg-gradient-to-br ${isPast ? "from-white/[0.03] to-transparent" : cfg.bg}
        ${isPast ? "" : cfg.glow}
        p-5 flex flex-col gap-3 overflow-hidden
        transition-transform duration-300 hover:scale-[1.02]
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${isPast ? "from-white/10 to-white/5" : cfg.accent} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isPast ? "bg-white/5 text-white/30 border-white/10" : cfg.badge}`}>
          {event.type}
        </span>
      </div>

      <p className="text-sm font-bold text-white leading-snug line-clamp-2 min-h-[40px]">
        {event.title}
      </p>

      {isToday ? (
        <div className="text-2xl font-black leading-none text-red-400">Today!</div>
      ) : (
        <div className="flex items-end gap-1.5">
          <span className={`text-5xl font-black tabular-nums leading-none ${urgentColor}`}>
            {displayDays}
          </span>
          <span className="text-xs text-white/40 font-semibold mb-1 leading-none">
            {daysLabel}
          </span>
        </div>
      )}

      <p className="text-[11px] text-white/40 flex items-center gap-1">
        <CalendarDays className="w-3 h-3 shrink-0" />
        {formatDate(event.due_date)}
      </p>
    </div>
  );
}

export default function ExamCountdown() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { events: loaded, fromCache: cached } = await loadExamCountdown((fresh) => {
        setEvents(fresh);
        setFromCache(false);
      });
      setEvents(loaded);
      setFromCache(cached);
    } catch (err) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      const fresh = await fetchExamEvents();
      try {
        localStorage.setItem("exam_countdown_cache", JSON.stringify({ data: fresh, timestamp: Date.now() }));
      } catch {}
      setEvents(fresh);
      setFromCache(false);
    } catch (err) {
      setError(err.message ?? "Failed to load");
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => { initialLoad(); }, [initialLoad]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">Exam Countdown</p>
          {fromCache && !loading && !refreshing && (
            <p className="text-[10px] text-white/20 mt-0.5">Cached · tap refresh to update</p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] h-[180px] rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-6 gap-2">
          <AlertCircle className="w-6 h-6 text-red-400/60" />
          <p className="text-sm text-white/30">Could not load Canvas events</p>
          <p className="text-[11px] text-red-400/50">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-6 gap-2">
          <CalendarDays className="w-6 h-6 text-white/20" />
          <p className="text-sm text-white/30">No upcoming events in Canvas</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {events.map((event) => (
            <CountdownCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}