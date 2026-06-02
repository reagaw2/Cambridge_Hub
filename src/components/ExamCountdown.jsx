import { useState, useEffect, useMemo } from "react";
import { Plus, X, Loader2, RefreshCw, Check, Trash2, Pencil } from "lucide-react";
import {
  daysUntil, loadEvents, forceSyncToSupabase,
  addManualEvent, deleteManualEvent, updateManualEvent,
  markEventComplete, unmarkEventComplete, getManualEvents,
} from "@/lib/examCountdownStore";

const CATEGORIES = ["Exam", "Test", "Quiz", "Assignment"];

const TYPE_CONFIG = {
  Exam: { label: "EXAMS", iconBg: "bg-cyan-500", iconText: "text-white", iconChar: "E", accent: "#22d3ee", cardBorder: "border-cyan-500/20", countColor: "text-cyan-300", emptyText: "No upcoming exams" },
  Test: { label: "TESTS", iconBg: "bg-violet-500", iconText: "text-white", iconChar: "T", accent: "#a78bfa", cardBorder: "border-violet-500/20", countColor: "text-violet-300", emptyText: "No upcoming tests" },
  Quiz: { label: "QUIZZES", iconBg: "bg-green-500", iconText: "text-white", iconChar: "Q", accent: "#4ade80", cardBorder: "border-green-500/20", countColor: "text-green-300", emptyText: "No upcoming quizzes" },
  Assignment: { label: "ASSIGNMENTS", iconBg: "bg-orange-500", iconText: "text-white", iconChar: "A", accent: "#fb923c", cardBorder: "border-orange-500/20", countColor: "text-orange-300", emptyText: "No upcoming assignments" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function EventModal({ onClose, onSave, editingEvent, defaultType }) {
  const isEdit = !!editingEvent;
  const parsedDate = isEdit && editingEvent.due_date ? editingEvent.due_date.slice(0, 10) : "";
  const parsedTime = isEdit && editingEvent.due_date ? editingEvent.due_date.slice(11, 16) : "23:59";

  const [title, setTitle] = useState(isEdit ? editingEvent.title : "");
  const [type, setType]   = useState(isEdit ? (editingEvent.type ?? defaultType ?? "Assignment") : (defaultType ?? "Assignment"));
  const [date, setDate]   = useState(parsedDate);
  const [time, setTime]   = useState(parsedTime);

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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors"><X className="w-4 h-4 text-white/50" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Paper 4" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(t => {
                const cfg = TYPE_CONFIG[t];
                const isActive = type === t;
                return (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${isActive ? "scale-[1.02]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/8"}`}
                    style={isActive ? { background: cfg.accent + "33", borderColor: cfg.accent + "88", color: cfg.accent } : {}}>
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

function EventCard({ event, cfg, onComplete, onDelete, onEdit }) {
  const days = daysUntil(event.due_date);
  const isToday  = days === 0;
  const isPast   = days !== null && days < 0;
  const isUrgent = !isPast && days !== null && days <= 3;

  const countNum   = isToday || isPast ? null : days;
  const countLabel = isToday ? "Today!" : isPast ? `${Math.abs(days ?? 0)}d ago` : null;
  const countColor = isToday ? "text-red-400" : isPast ? "text-red-400/70" : isUrgent ? "text-orange-400" : cfg.countColor;

  return (
    <div className={`group relative flex-shrink-0 w-36 rounded-xl border ${cfg.cardBorder} bg-white/[0.04] hover:bg-white/[0.07] p-3.5 flex flex-col gap-2 transition-all`} style={{ minWidth: 140 }}>
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(event)} className="p-1 rounded-lg hover:bg-white/15 transition-all"><Pencil className="w-2.5 h-2.5 text-white/40" /></button>
        <button onClick={() => onDelete(event.id)} className="p-1 rounded-lg hover:bg-red-500/20 transition-all"><X className="w-2.5 h-2.5 text-white/40 hover:text-red-400" /></button>
      </div>
      <p className="text-xs font-semibold text-white/90 leading-snug pr-8 line-clamp-2">{event.title}</p>
      <div className="flex items-baseline gap-1">
        {countNum !== null ? (
          <><span className={`text-3xl font-black tabular-nums leading-none ${countColor}`}>{countNum}</span><span className="text-xs font-semibold text-white/40 leading-none">days</span></>
        ) : (
          <span className={`text-lg font-black leading-none ${countColor}`}>{countLabel}</span>
        )}
      </div>
      <div className="space-y-0.5 mt-auto">
        <div className="flex items-center gap-1 text-[10px] text-white/35"><span>Date:</span><span>{fmtDate(event.due_date)}</span></div>
        <div className="flex items-center gap-1 text-[10px] text-white/35"><span>Time:</span><span>{fmtTime(event.due_date)}</span></div>
      </div>
      <button onClick={() => onComplete(event.id)}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full border border-white/15 hover:bg-green-500/20 hover:border-green-500/40 transition-all">
        <Check className="w-2.5 h-2.5 text-white/30 hover:text-green-400" />
      </button>
    </div>
  );
}

function AddCard({ cfg, onAdd }) {
  return (
    <button onClick={onAdd} className={`flex-shrink-0 w-14 rounded-xl border border-dashed ${cfg.cardBorder} hover:bg-white/[0.04] flex items-center justify-center transition-all`} style={{ minWidth: 56, minHeight: 120 }}>
      <Plus className="w-5 h-5 text-white/20 hover:text-white/50 transition-colors" />
    </button>
  );
}

function CategorySection({ type, events, onAdd, onComplete, onDelete, onEdit }) {
  const cfg = TYPE_CONFIG[type];
  const upcoming = events.filter(e => !e.completed);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className={`w-5 h-5 rounded-md ${cfg.iconBg} flex items-center justify-center shrink-0`}>
          <span className={`text-[9px] font-black ${cfg.iconText}`}>{cfg.iconChar}</span>
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">{cfg.label}</span>
        {upcoming.length > 0 && <span className="font-mono text-[10px] text-white/30">{upcoming.length}</span>}
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
        {upcoming.length === 0 ? (
          <button onClick={onAdd} className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors py-1.5">
            <Plus className="w-3.5 h-3.5" /><span>{cfg.emptyText}</span>
          </button>
        ) : (
          <>
            {upcoming.map(e => (
              <EventCard key={e.id} event={e} cfg={cfg} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
            ))}
            <AddCard cfg={cfg} onAdd={onAdd} />
          </>
        )}
      </div>
    </div>
  );
}

function CompletedSection({ events, onUncomplete, onDelete }) {
  const [open, setOpen] = useState(false);
  if (events.length === 0) return null;
  return (
    <div className="space-y-2">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors">
        <span>{open ? "▲" : "▼"}</span><span>{events.length} completed</span>
      </button>
      {open && (
        <div className="space-y-1.5 pl-1">
          {events.map(e => {
            const cfg = TYPE_CONFIG[e.type] ?? TYPE_CONFIG["Assignment"];
            return (
              <div key={e.id} className="group flex items-center gap-3 py-2 px-3 rounded-xl border border-white/5 bg-white/[0.015] opacity-50 hover:opacity-75 transition-all">
                <div className={`w-4 h-4 rounded ${cfg.iconBg} flex items-center justify-center shrink-0`}><span className="text-[7px] font-black text-white">{cfg.iconChar}</span></div>
                <p className="text-xs text-white/50 line-through flex-1 truncate">{e.title}</p>
                <p className="text-[10px] text-white/25 shrink-0">{fmtDate(e.due_date)}</p>
                <button onClick={() => onUncomplete(e.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">↩</button>
                <button onClick={() => onDelete(e.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExamCountdown() {
  // Use getManualEvents() so initial state reads from the user-scoped localStorage key
  const [events, setEvents] = useState(getManualEvents);
  const [syncStatus, setSyncStatus] = useState(null);
  const [modal, setModal] = useState(null);

  // Background sync — refreshes from Supabase quietly
  useEffect(() => {
    loadEvents().then(remote => {
      if (Array.isArray(remote)) setEvents(remote);
    }).catch(() => {});
  }, []);

  async function handleForceSync() {
    setSyncStatus("syncing");
    const ok = await forceSyncToSupabase();
    setSyncStatus(ok ? "done" : "error");
    setTimeout(() => setSyncStatus(null), 2500);
  }

  function handleSave({ title, type, due_date, id }) {
    const updated = id ? updateManualEvent(id, { title, type, due_date }) : addManualEvent({ title, type, due_date });
    setEvents([...updated]);
  }
  function handleDelete(id) { setEvents([...deleteManualEvent(id)]); }
  function handleEdit(event) { setModal({ editingEvent: event }); }
  function handleComplete(id) { setEvents([...markEventComplete(id)]); }
  function handleUncomplete(id) { setEvents([...unmarkEventComplete(id)]); }

  const completedEvents = useMemo(() => events.filter(e => e.completed), [events]);

  const sortedUpcoming = useMemo(() =>
    events.filter(e => !e.completed)
      .sort((a, b) => new Date(a.due_date ?? "9999").getTime() - new Date(b.due_date ?? "9999").getTime()),
    [events]
  );

  function getEventsForType(type) { return sortedUpcoming.filter(e => (e.type ?? "Assignment") === type); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Upcoming</p>
        <div className="flex items-center gap-2">
          <button onClick={handleForceSync} disabled={syncStatus === "syncing"}
            className={`flex items-center gap-1 text-[10px] font-semibold border rounded-lg px-2 py-1 transition-all ${
              syncStatus === "done" ? "border-green-500/40 text-green-400 bg-green-500/10"
              : syncStatus === "error" ? "border-red-500/40 text-red-400"
              : "border-white/10 text-white/25 hover:text-white/50 hover:bg-white/5"
            } disabled:opacity-50`}>
            {syncStatus === "syncing" ? <><Loader2 className="w-2.5 h-2.5 animate-spin" />Syncing</>
              : syncStatus === "done" ? <><Check className="w-2.5 h-2.5" />Synced</>
              : <><RefreshCw className="w-2.5 h-2.5" />Sync</>}
          </button>
          <button onClick={() => setModal({})}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-all">
            <Plus className="w-3 h-3" /> Add event
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {CATEGORIES.map(type => (
          <CategorySection key={type} type={type} events={getEventsForType(type)}
            onAdd={() => setModal({ defaultType: type })}
            onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>

      <CompletedSection events={completedEvents} onUncomplete={handleUncomplete} onDelete={handleDelete} />

      {modal !== null && (
        <EventModal onClose={() => setModal(null)} onSave={handleSave}
          editingEvent={modal.editingEvent ?? null} defaultType={modal.defaultType ?? null} />
      )}
    </div>
  );
}