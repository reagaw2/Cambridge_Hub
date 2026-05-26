/**
 * ExamCountdown — horizontal grid of upcoming Canvas exam cards.
 * Debug mode enabled to diagnose empty results.
 */
import { useEffect, useState, useCallback } from "react";
import { daysUntil } from "@/lib/examCountdownStore";
import { CalendarDays, Clock, FileText, FlaskConical, RefreshCw, AlertCircle, Bug } from "lucide-react";

const CANVAS_BASE_URL = "https://africanleadershipacademy.instructure.com";
const CANVAS_TOKEN = "4000~FwAyNtXQfTxYXachFuaffNRMXwM96CQ3YyfWGycukUN7xFxLQh6NreTPkTJk6h68";

const TYPE_CONFIG = {
  Exam: { icon: FileText, border: "border-cyan-500/30", bg: "from-cyan-500/10 to-blue-600/5", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", accent: "from-cyan-500 to-blue-600" },
  "Internal Test": { icon: FlaskConical, border: "border-violet-500/30", bg: "from-violet-500/10 to-purple-600/5", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30", accent: "from-violet-500 to-purple-600" },
  Assignment: { icon: Clock, border: "border-amber-500/30", bg: "from-amber-500/10 to-orange-600/5", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", accent: "from-amber-500 to-orange-600" },
};

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function CountdownCard({ event }) {
  const days = daysUntil(event.due_date);
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG["Assignment"];
  const Icon = cfg.icon;
  const isPast = days !== null && days < 0;
  const isToday = days === 0;
  const urgentColor = isPast ? "text-white/30" : isToday ? "text-red-400" : days <= 3 ? "text-orange-400" : cfg.text;
  const displayDays = isPast ? Math.abs(days) : days;
  const daysLabel = isPast ? `day${displayDays !== 1 ? "s" : ""} ago` : isToday ? "Today!" : `day${displayDays !== 1 ? "s" : ""}`;

  return (
    <div className={`relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl border ${isPast ? "border-white/8 opacity-50" : cfg.border} bg-gradient-to-br ${isPast ? "from-white/[0.03] to-transparent" : cfg.bg} p-5 flex flex-col gap-3 overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}>{event.type}</span>
      </div>
      <p className="text-sm font-bold text-white leading-snug line-clamp-2 min-h-[40px]">{event.title}</p>
      <div className={`text-3xl font-black leading-none ${urgentColor}`}>{isToday ? "Today!" : `${displayDays} ${daysLabel}`}</div>
      <p className="text-[11px] text-white/40 flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0" />{formatDate(event.due_date)}</p>
    </div>
  );
}

async function tryFetch(url) {
  const proxies = [
    { name: "corsproxy.io", make: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}` },
    { name: "allorigins", make: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` },
    { name: "direct", make: (u) => u },
  ];

  for (const { name, make } of proxies) {
    try {
      const res = await fetch(make(url), { signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      return { proxy: name, status: res.status, ok: res.ok, text: text.slice(0, 500), data: res.ok ? JSON.parse(text) : null };
    } catch (e) {
      // try next
    }
  }
  return { proxy: "all failed", status: 0, ok: false, text: "All proxies failed", data: null };
}

export default function ExamCountdown() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  const runFetch = useCallback(async () => {
    setLoading(true);
    setDebugLog([]);
    const log = [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    const tok = CANVAS_TOKEN;

    const urls = [
      { label: "Calendar Events", url: `${CANVAS_BASE_URL}/api/v1/users/self/calendar_events?type=event&start_date=${start}&end_date=${end}&access_token=${tok}&per_page=100` },
      { label: "Upcoming Events", url: `${CANVAS_BASE_URL}/api/v1/users/self/upcoming_events?access_token=${tok}&per_page=100` },
      { label: "Assignment Events", url: `${CANVAS_BASE_URL}/api/v1/users/self/calendar_events?type=assignment&start_date=${start}&end_date=${end}&access_token=${tok}&per_page=100` },
    ];

    const allEvents = [];

    for (const { label, url } of urls) {
      const result = await tryFetch(url);
      const count = Array.isArray(result.data) ? result.data.length : "N/A";
      log.push({ label, proxy: result.proxy, status: result.status, count, preview: result.text });

      if (Array.isArray(result.data)) {
        result.data.forEach((e) => {
          const title = e.title ?? e.assignment?.name ?? "Untitled";
          const due = e.start_at ?? e.end_at ?? e.assignment?.due_at ?? null;
          const type = title.toLowerCase().includes("exam") || title.toLowerCase().includes("paper")
            ? "Exam"
            : title.toLowerCase().includes("test") || title.toLowerCase().includes("quiz")
              ? "Internal Test"
              : "Assignment";
          if (due) allEvents.push({ id: `${label}_${e.id}`, title, type, due_date: due });
        });
      }
    }

    setDebugLog(log);

    const seen = new Set();
    const unique = allEvents
      .filter((e) => { const k = `${e.title}__${e.due_date?.slice(0, 10)}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    setEvents(unique);
    setLoading(false);
    setShowDebug(true);
  }, []);

  useEffect(() => { runFetch(); }, [runFetch]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Exam Countdown</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDebug(d => !d)} className="flex items-center gap-1 text-[11px] text-amber-400/60 hover:text-amber-400 transition-colors">
            <Bug className="w-3 h-3" /> Debug
          </button>
          <button onClick={runFetch} disabled={loading} className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-40">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Debug panel */}
      {showDebug && debugLog.length > 0 && (
        <div className="bg-black/60 border border-amber-500/30 rounded-xl p-4 space-y-3 text-[11px] font-mono overflow-x-auto">
          <p className="text-amber-400 font-bold text-xs">Debug Output — {events.length} events found</p>
          {debugLog.map((entry, i) => (
            <div key={i} className="space-y-1 border-t border-white/10 pt-2">
              <p className="text-white/70 font-bold">{entry.label}</p>
              <p>Proxy: <span className="text-cyan-400">{entry.proxy}</span> · Status: <span className={entry.status === 200 ? "text-green-400" : "text-red-400"}>{entry.status}</span> · Items: <span className="text-white">{entry.count}</span></p>
              <p className="text-white/30 break-all whitespace-pre-wrap">{entry.preview}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3].map((i) => <div key={i} className="flex-shrink-0 w-[200px] h-[180px] rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <CalendarDays className="w-7 h-7 text-white/20" />
          <p className="text-sm text-white/30">No events found — check debug output above</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {events.map((event) => <CountdownCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}