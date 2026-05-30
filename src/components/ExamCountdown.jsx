import { useState, useEffect, useMemo } from "react";
import {
  Plus, Check, CheckCircle2, AlertTriangle, X,
  RefreshCw, Loader2, Trash2, Pencil, Clock, RotateCcw,
} from "lucide-react";
import {
  daysUntil, loadEvents, forceSyncToSupabase,
  addManualEvent, deleteManualEvent, updateManualEvent,
  markEventComplete, unmarkEventComplete, setOverdueStatus,
} from "@/lib/examCountdownStore";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ["Exam", "Test", "Quiz", "Assignment"];

const TYPE_CONFIG = {
  Exam:       { accent: "#22d3ee", border: "border-l-cyan-400",   bg: "bg-cyan-500/10",   text: "text-cyan-300",   badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"   },
  Test:       { accent: "#a78bfa", border: "border-l-violet-400", bg: "bg-violet-500/10", text: "text-violet-300", badge: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  Quiz:       { accent: "#4ade80", border: "border-l-green-400",  bg: "bg-green-500/10",  text: "text-green-300",  badge: "bg-green-500/20 text-green-300 border-green-500/40"  },
  Assignment: { accent: "#fbbf24", border: "border-l-amber-400",  bg: "bg-amber-500/10",  text: "text-amber-300",  badge: "bg-amber-500/20 text-amber-300 border-amber-500/40"  },
};

const STATUS_CONFIG = {
  submitted_late: {
    label: "Submitted Late",
    emoji: "⏰",
    sectionBorder: "border-amber-500/40",
    sectionBg: "bg-amber-500/8",
    cardBorderL: "border-l-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  failed_to_submit: {
    label: "Failed to Submit",
    emoji: "❌",
    sectionBorder: "border-red-800/50",
    sectionBg: "bg-red-900/10",
    cardBorderL: "border-l-red-700",
    badge: "bg-red-800/20 text-red-400 border-red-800/40",
  },
  forgot_to_complete: {
    label: "Forgot to Mark Complete",
    emoji: "🔵",
    sectionBorder: "border-blue-400/40",
    sectionBg: "bg-blue-500/8",
    cardBorderL: "border-l-blue-400",
    badge: "bg-blue-500/15 text-blue-300 border-blue-400/40",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getMonthKey(isoDate) {
  if (!isoDate) return "9999-12";
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key) {
  if (key === "9999-12") return "Unknown Date";
  const [year, month] = key.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// ── Event Modal ────────────────────────────────────────────────────────────────

function EventModal({ onClose, onSave, editingEvent }) {
  const isEdit = !!editingEvent;
  const parsedDate = isEdit && editingEvent.due_date ? editingEvent.due_date.slice(0, 10) : "";
  const parsedTime = isEdit && editingEvent.due_date ? editingEvent.due_date.slice(11, 16) : "23:59";

  const [title, setTitle] = useState(isEdit ? editingEvent.title : "");
  const [type, setType] = useState(isEdit ? editingEvent.type : "Assignment");
  const [date, setDate] = useState(parsedDate);
  const [time, setTime] = useState(parsedTime);

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({ title, type, due_date: `${date}T${time}:00`, id: editingEvent?.id });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 space-y-5 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="font-bold text-white">{isEdit ? "Edit Event" : "Add Event"}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Paper 4" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20" />
          </div>

          {/* Category selector — prominent pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(t => {
                const cfg = TYPE_CONFIG[t];
                return (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      type === t
                        ? `${cfg.badge} border-opacity-80 scale-[1.03] shadow-sm`
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/8"
                    }`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]" />
            </div>
          </div>
          <button type="submit" disabled={!title.trim() || !date}
            className="w-full bg-white/10 border border-white/20 text-white font-semibold text-sm py-3 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all disabled:opacity-40">
            {isEdit ? "Save Changes" : "Add Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Horizontal Active Card ─────────────────────────────────────────────────────

function ActiveCard({ event, onComplete, onDelete, onEdit }) {
  const days = daysUntil(event.due_date);
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG["Assignment"];
  const isToday = days === 0;
  const isUrgent = days !== null && days >= 0 && days <= 3;

  const countColor = isToday
    ? "text-red-400"
    : isUrgent
      ? "text-orange-400"
      : cfg.text;

  const countLabel = isToday
    ? "Today"
    : days === 1
      ? "Tomorrow"
      : days !== null && days > 0
        ? `${days}d`
        : null;

  return (
    <div className={`group flex items-center gap-3 rounded-xl border-l-4 border border-white/8 ${cfg.border} bg-white/[0.03] hover:bg-white/[0.05] px-4 py-3 transition-all`}>

      {/* Category badge */}
      <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border ${cfg.badge}`}>
        {event.type}
      </span>

      {/* Title + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug truncate">{event.title}</p>
        <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 shrink-0" />
          {fmtDate(event.due_date)}
        </p>
      </div>

      {/* Countdown */}
      {countLabel && (
        <div className={`shrink-0 text-right`}>
          <p className={`text-sm font-black tabular-nums ${countColor}`}>{countLabel}</p>
        </div>
      )}

      {/* Actions — visible on hover */}
      <div className="shrink-0 flex items-center gap-1">
        <button onClick={() => onEdit(event)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition-all">
          <Pencil className="w-3 h-3 text-white/40" />
        </button>
        <button onClick={() => onDelete(event.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all">
          <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
        </button>
        <button onClick={() => onComplete(event.id)} title="Mark complete"
          className="p-1.5 rounded-lg border border-white/10 hover:bg-green-500/20 hover:border-green-500/40 transition-all">
          <Check className="w-3.5 h-3.5 text-white/25 hover:text-green-400" />
        </button>
      </div>
    </div>
  );
}

// ── Horizontal Overdue Card (awaiting status) ──────────────────────────────────

function OverdueCard({ event, onSetStatus, onDelete, onComplete }) {
  const days = daysUntil(event.due_date);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border-l-4 border border-red-500/40 border-l-red-500 bg-red-500/8 overflow-hidden">
      {/* Horizontal summary row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border bg-red-500/20 text-red-300 border-red-500/40">
          {event.type}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90 truncate">{event.title}</p>
          <p className="text-[10px] text-red-400/70 mt-0.5">{Math.abs(days ?? 0)}d overdue · {fmtDate(event.due_date)}</p>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="shrink-0 text-[11px] font-semibold text-red-400/70 hover:text-red-400 border border-red-500/30 rounded-lg px-2 py-1 transition-all">
          {expanded ? "▲" : "What happened?"}
        </button>
        <button onClick={() => onDelete(event.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 transition-all">
          <Trash2 className="w-3 h-3 text-red-400/50" />
        </button>
      </div>

      {/* Expandable status picker */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-red-500/20 pt-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => onSetStatus(event.id, key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all hover:brightness-110 active:scale-[0.99] ${cfg.badge}`}>
              <span className="text-base shrink-0">{cfg.emoji}</span>
              {cfg.label}
            </button>
          ))}
          <button onClick={() => onComplete(event.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-semibold text-left transition-all hover:brightness-110">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Mark complete (done on time)
          </button>
        </div>
      )}
    </div>
  );
}

// ── Horizontal Status Card ─────────────────────────────────────────────────────

function StatusCard({ event, statusKey, onSetStatus, onDelete }) {
  const cfg = STATUS_CONFIG[statusKey];
  return (
    <div className={`group flex items-center gap-3 rounded-xl border-l-4 border border-white/8 ${cfg.cardBorderL} bg-white/[0.02] px-4 py-3 transition-all hover:brightness-105`}>
      <span className="text-base shrink-0">{cfg.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/70 truncate">{event.title}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{fmtDate(event.due_date)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onSetStatus(event.id, null)} title="Change status"
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
          <RotateCcw className="w-3 h-3 text-white/30" />
        </button>
        <button onClick={() => onDelete(event.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/15 transition-all">
          <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ── Horizontal Complete Card ───────────────────────────────────────────────────

function CompleteCard({ event, onUncomplete, onDelete }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border-l-4 border-l-green-500/60 border border-white/5 bg-white/[0.015] px-4 py-2.5 opacity-55 hover:opacity-75 transition-all">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/60 line-through truncate">{event.title}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{fmtDate(event.due_date)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onUncomplete(event.id)} title="Undo"
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
          <RotateCcw className="w-3 h-3 text-white/40" />
        </button>
        <button onClick={() => onDelete(event.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/15 transition-all">
          <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ── Month Section ──────────────────────────────────────────────────────────────

function MonthSection({ monthKey, events, handlers }) {
  const label = getMonthLabel(monthKey);
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [completeOpen, setCompleteOpen] = useState(false);

  const active = events.filter(e => !e.completed && (daysUntil(e.due_date) ?? 0) >= 0);
  const overdue = events.filter(e => !e.completed && (daysUntil(e.due_date) ?? 0) < 0);
  const complete = events.filter(e => e.completed);

  const overdueAwaiting = overdue.filter(e => !e.overdueStatus);
  const overdueWithStatus = overdue.filter(e => !!e.overdueStatus);

  if (events.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Month divider */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-white/8" />
        <p className="text-[11px] font-black uppercase tracking-widest text-white/35 shrink-0">{label}</p>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Upcoming */}
      {active.length > 0 && (
        <div className="space-y-1.5">
          {active.map(e => (
            <ActiveCard key={e.id} event={e}
              onComplete={handlers.onComplete}
              onDelete={handlers.onDelete}
              onEdit={handlers.onEdit}
            />
          ))}
        </div>
      )}

      {/* Overdue collapsible section */}
      {overdue.length > 0 && (
        <div className={`rounded-xl border ${overdueOpen ? "border-red-500/30" : "border-white/8"} overflow-hidden`}>
          <button onClick={() => setOverdueOpen(o => !o)}
            className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${overdueOpen ? "bg-red-500/8" : "bg-white/[0.02] hover:bg-white/[0.04]"}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <p className="text-xs font-bold text-red-400">Overdue</p>
              <span className="font-mono text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{overdue.length}</span>
            </div>
            <span className="text-[10px] text-white/25">{overdueOpen ? "▲" : "▼"}</span>
          </button>

          {overdueOpen && (
            <div className="px-3 pb-3 pt-2 space-y-3 bg-red-500/5">
              {/* Awaiting a status */}
              {overdueAwaiting.length > 0 && (
                <div className="space-y-1.5">
                  {overdueAwaiting.map(e => (
                    <OverdueCard key={e.id} event={e}
                      onSetStatus={handlers.onSetStatus}
                      onDelete={handlers.onDelete}
                      onComplete={handlers.onComplete}
                    />
                  ))}
                </div>
              )}

              {/* Status sub-sections */}
              {Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => {
                const group = overdueWithStatus.filter(e => e.overdueStatus === statusKey);
                if (group.length === 0) return null;
                return (
                  <div key={statusKey} className={`rounded-xl border ${cfg.sectionBorder} ${cfg.sectionBg} p-3 space-y-1.5`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{cfg.emoji}</span>
                      <p className={`text-[10px] font-black uppercase tracking-widest opacity-80 ${cfg.badge.split(" ").find(c => c.startsWith("text-"))}`}>
                        {cfg.label}
                      </p>
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>{group.length}</span>
                    </div>
                    {group.map(e => (
                      <StatusCard key={e.id} event={e} statusKey={statusKey}
                        onSetStatus={handlers.onSetStatus}
                        onDelete={handlers.onDelete}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Complete collapsible section */}
      {complete.length > 0 && (
        <div className={`rounded-xl border ${completeOpen ? "border-green-500/25" : "border-white/8"} overflow-hidden`}>
          <button onClick={() => setCompleteOpen(o => !o)}
            className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${completeOpen ? "bg-green-500/5" : "bg-white/[0.02] hover:bg-white/[0.04]"}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <p className="text-xs font-bold text-green-400">Complete</p>
              <span className="font-mono text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">{complete.length}</span>
            </div>
            <span className="text-[10px] text-white/25">{completeOpen ? "▲" : "▼"}</span>
          </button>

          {completeOpen && (
            <div className="px-3 pb-3 pt-2 space-y-1.5 bg-green-500/5">
              {complete.map(e => (
                <CompleteCard key={e.id} event={e}
                  onUncomplete={handlers.onUncomplete}
                  onDelete={handlers.onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export default function ExamCountdown() {
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem("exam_countdown_events_v3") ?? "[]"); } catch { return []; }
  });
  const [syncing, setSyncing] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadEvents().then(remote => { setEvents(remote); setSyncing(false); }).catch(() => setSyncing(false));
  }, []);

  async function handleForceSync() {
    setSyncStatus("syncing");
    const ok = await forceSyncToSupabase();
    setSyncStatus(ok ? "done" : "error");
    setTimeout(() => setSyncStatus(null), 2500);
  }

  function handleAdd({ title, type, due_date, id }) {
    const updated = id
      ? updateManualEvent(id, { title, type, due_date })
      : addManualEvent({ title, type, due_date });
    setEvents(updated);
  }

  function handleDelete(id) { setEvents(deleteManualEvent(id)); }
  function handleEdit(event) { setEditingEvent(event); setShowModal(true); }
  function handleComplete(id) { setEvents(markEventComplete(id)); }
  function handleUncomplete(id) { setEvents(unmarkEventComplete(id)); }
  function handleSetStatus(id, status) { setEvents(setOverdueStatus(id, status)); }

  const monthGroups = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.due_date ?? "9999-12-31").getTime() - new Date(b.due_date ?? "9999-12-31").getTime()
    );
    const groups = {};
    for (const e of sorted) {
      const key = getMonthKey(e.due_date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    }
    return groups;
  }, [events]);

  const monthKeys = Object.keys(monthGroups).sort();
  const handlers = { onComplete: handleComplete, onUncomplete: handleUncomplete, onSetStatus: handleSetStatus, onDelete: handleDelete, onEdit: handleEdit };

  const totalEvents = events.length;
  const completedCount = events.filter(e => e.completed).length;
  const overdueCount = events.filter(e => !e.completed && (daysUntil(e.due_date) ?? 0) < 0).length;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">My Schedule</p>
          {totalEvents > 0 && (
            <p className="text-[10px] text-white/20 mt-0.5">
              {completedCount}/{totalEvents} complete
              {overdueCount > 0 && <span className="text-red-400/70 ml-2">· {overdueCount} overdue</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleForceSync} disabled={syncStatus === "syncing"}
            className={`flex items-center gap-1.5 text-[11px] font-semibold border rounded-lg px-2.5 py-1.5 transition-all ${
              syncStatus === "done" ? "border-green-500/40 text-green-400 bg-green-500/10"
              : syncStatus === "error" ? "border-red-500/40 text-red-400 bg-red-500/10"
              : "border-white/10 text-white/35 hover:text-white/60 hover:bg-white/5"
            } disabled:opacity-50`}>
            {syncStatus === "syncing" ? <><Loader2 className="w-3 h-3 animate-spin" />Syncing…</>
              : syncStatus === "done" ? <><Check className="w-3 h-3" />Synced</>
              : syncStatus === "error" ? <>⚠ Failed</>
              : <><RefreshCw className="w-3 h-3" />Sync</>}
          </button>
          <button onClick={() => { setEditingEvent(null); setShowModal(true); }}
            className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 border border-white/10 rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition-all">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      </div>

      {syncing && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
          <p className="text-xs text-white/30">Loading your schedule…</p>
        </div>
      )}

      {!syncing && totalEvents === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <p className="text-sm text-white/30">No events yet.</p>
          <p className="text-xs text-white/20">Add exams, tests, quizzes and assignments to track them here.</p>
        </div>
      )}

      {!syncing && monthKeys.map(key => (
        <MonthSection key={key} monthKey={key} events={monthGroups[key]} handlers={handlers} />
      ))}

      {showModal && (
        <EventModal
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
          onSave={handleAdd}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
}