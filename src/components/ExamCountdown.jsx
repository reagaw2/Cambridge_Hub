import { useState } from "react";
import { CalendarDays, FileText, FlaskConical, BookOpen, Plus, Trash2, X, PenLine, Pencil, Clock } from "lucide-react";
import { daysUntil, getManualEvents, addManualEvent, deleteManualEvent, saveManualEvents } from "@/lib/examCountdownStore";

const CATEGORIES = ["Exam", "Test", "Quiz", "Assignment"];

const TYPE_CONFIG = {
  Exam: {
    icon: FileText,
    border: "border-cyan-500/30",
    bg: "from-cyan-500/10 to-blue-600/5",
    text: "text-cyan-400",
    accent: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_24px_rgba(6,182,212,0.2)]",
    emptyText: "No upcoming exams",
  },
  Test: {
    icon: FlaskConical,
    border: "border-violet-500/30",
    bg: "from-violet-500/10 to-purple-600/5",
    text: "text-violet-400",
    accent: "from-violet-500 to-purple-600",
    glow: "shadow-[0_0_24px_rgba(139,92,246,0.2)]",
    emptyText: "No upcoming tests",
  },
  Quiz: {
    icon: BookOpen,
    border: "border-green-500/30",
    bg: "from-green-500/10 to-emerald-600/5",
    text: "text-green-400",
    accent: "from-green-500 to-emerald-600",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.2)]",
    emptyText: "No upcoming quizzes",
  },
  Assignment: {
    icon: PenLine,
    border: "border-amber-500/30",
    bg: "from-amber-500/10 to-orange-600/5",
    text: "text-amber-400",
    accent: "from-amber-500 to-orange-600",
    glow: "shadow-[0_0_24px_rgba(245,158,11,0.15)]",
    emptyText: "No upcoming assignments",
  },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function CountdownCard({ event, onDelete, onEdit }) {
  const days = daysUntil(event.due_date);
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG["Assignment"];
  const Icon = cfg.icon;
  const isPast = days !== null && days < 0;
  const isToday = days === 0;
  const isUrgent = days !== null && days >= 0 && days <= 3;
  const countColor = isPast ? "text-white/25" : isToday ? "text-red-400" : isUrgent ? "text-orange-400" : cfg.text;

  return (
    <div className={`group relative rounded-xl border p-4 flex flex-col gap-2 overflow-hidden transition-all duration-200 hover:scale-[1.015] ${isPast ? "border-white/8 opacity-40" : `${cfg.border} ${cfg.glow}`} bg-gradient-to-br ${isPast ? "from-white/[0.02] to-transparent" : cfg.bg}`}>
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => onEdit(event)}
          className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <Pencil className="w-2.5 h-2.5 text-white/60" />
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center"
        >
          <Trash2 className="w-2.5 h-2.5 text-white/60" />
        </button>
      </div>

      <p className="text-xs font-bold text-white leading-snug pr-12 line-clamp-2">{event.title}</p>

      {isToday ? (
        <p className="text-lg font-black text-red-400 leading-none">Today!</p>
      ) : (
        <div className="flex items-end gap-1">
          <span className={`text-3xl font-black tabular-nums leading-none ${countColor}`}>{Math.abs(days ?? 0)}</span>
          <span className="text-[10px] text-white/35 font-semibold mb-0.5 leading-none">
            {isPast ? "ago" : "days"}
          </span>
        </div>
      )}

      <div className="space-y-0.5">
        <p className="text-[10px] text-white/35 flex items-center gap-1">
          <CalendarDays className="w-2.5 h-2.5 shrink-0" />
          {fmtDate(event.due_date)}
        </p>
        <p className="text-[10px] text-white/35 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 shrink-0" />
          {fmtTime(event.due_date)}
        </p>
      </div>
    </div>
  );
}

function EventModal({ onClose, onSave, editingEvent }) {
  const isEdit = !!editingEvent;

  // Parse existing due_date into date + time parts for the inputs
  const parsedDate = isEdit && editingEvent.due_date
    ? editingEvent.due_date.slice(0, 10)
    : "";
  const parsedTime = isEdit && editingEvent.due_date
    ? editingEvent.due_date.slice(11, 16)
    : "23:59";

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
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Physics Paper 4"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${type === t ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/8 text-white/40 hover:bg-white/10"}`}>
                  {t}
                </button>
              ))}
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

function CategoryLane({ category, events, onDelete, onEdit, onAdd }) {
  const cfg = TYPE_CONFIG[category];
  const Icon = cfg.icon;
  const laneEvents = events.filter(e => e.type === category);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${cfg.accent} flex items-center justify-center`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${cfg.text}`}>{category}s</p>
        {laneEvents.length > 0 && (
          <span className="text-[10px] text-white/20 font-mono">{laneEvents.length}</span>
        )}
      </div>

      {laneEvents.length === 0 ? (
        <button onClick={onAdd}
          className="w-full border border-dashed border-white/8 rounded-xl py-3 flex items-center justify-center gap-2 hover:border-white/15 hover:bg-white/[0.02] transition-all">
          <Plus className="w-3 h-3 text-white/20" />
          <span className="text-[11px] text-white/20">{cfg.emptyText}</span>
        </button>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {laneEvents.map(ev => (
            <div key={ev.id} className="flex-shrink-0 w-[150px]">
              <CountdownCard event={ev} onDelete={onDelete} onEdit={onEdit} />
            </div>
          ))}
          <button onClick={onAdd}
            className="flex-shrink-0 w-[80px] rounded-xl border border-dashed border-white/8 hover:border-white/15 hover:bg-white/[0.02] flex flex-col items-center justify-center gap-1 transition-all min-h-[120px]">
            <Plus className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[10px] text-white/20">Add</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExamCountdown() {
  const [events, setEvents] = useState(() => getManualEvents());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  function handleAdd(data) {
    setEvents(addManualEvent(data));
  }

  function handleEdit(event) {
    setEditingEvent(event);
    setShowModal(true);
  }

  function handleSave({ title, type, due_date, id }) {
    if (id) {
      // Edit existing
      const updated = getManualEvents().map(e =>
        e.id === id ? { ...e, title, type, due_date } : e
      ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      saveManualEvents(updated);
      setEvents(updated);
    } else {
      // New event
      setEvents(addManualEvent({ title, type, due_date }));
    }
  }

  function handleDelete(id) {
    setEvents(deleteManualEvent(id));
  }

  function openAddModal() {
    setEditingEvent(null);
    setShowModal(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Upcoming</p>
        <button onClick={openAddModal}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/5">
          <Plus className="w-3 h-3" /> Add event
        </button>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map(cat => (
          <CategoryLane
            key={cat}
            category={cat}
            events={events}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAdd={openAddModal}
          />
        ))}
      </div>

      {showModal && (
        <EventModal
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
          onSave={handleSave}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
}