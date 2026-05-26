import { useState } from "react";
import { CalendarDays, Clock, FileText, FlaskConical, Plus, Trash2, X } from "lucide-react";
import { daysUntil, getManualEvents, addManualEvent, deleteManualEvent } from "@/lib/examCountdownStore";

const TYPE_CONFIG = {
  Exam: {
    icon: FileText,
    border: "border-cyan-500/30",
    bg: "from-cyan-500/10 to-blue-600/5",
    text: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    accent: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.2)]",
  },
  "Internal Test": {
    icon: FlaskConical,
    border: "border-violet-500/30",
    bg: "from-violet-500/10 to-purple-600/5",
    text: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    accent: "from-violet-500 to-purple-600",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.2)]",
  },
  Assignment: {
    icon: Clock,
    border: "border-amber-500/30",
    bg: "from-amber-500/10 to-orange-600/5",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    accent: "from-amber-500 to-orange-600",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function CountdownCard({ event, onDelete }) {
  const days = daysUntil(event.due_date);
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG["Assignment"];
  const Icon = cfg.icon;
  const isPast = days !== null && days < 0;
  const isToday = days === 0;
  const isUrgent = days !== null && days >= 0 && days <= 3;
  const countColor = isPast ? "text-white/30" : isToday ? "text-red-400" : isUrgent ? "text-orange-400" : cfg.text;

  return (
    <div className={`group relative flex-shrink-0 w-48 rounded-2xl border p-5 flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:scale-[1.02] ${isPast ? "border-white/8 opacity-50" : `${cfg.border} ${cfg.glow}`} bg-gradient-to-br ${isPast ? "from-white/[0.03] to-transparent" : cfg.bg}`}>
      <button
        onClick={() => onDelete(event.id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3 h-3 text-white/60" />
      </button>

      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${isPast ? "from-white/10 to-white/5" : cfg.accent} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isPast ? "bg-white/5 text-white/30 border-white/10" : cfg.badge}`}>
          {event.type}
        </span>
      </div>

      <p className="text-sm font-bold text-white leading-snug line-clamp-2 min-h-[40px]">{event.title}</p>

      {isToday ? (
        <p className="text-2xl font-black text-red-400">Today!</p>
      ) : (
        <div className="flex items-end gap-1.5">
          <span className={`text-5xl font-black tabular-nums leading-none ${countColor}`}>{Math.abs(days ?? 0)}</span>
          <span className="text-xs text-white/40 font-semibold mb-1 leading-none">
            {isPast ? "days ago" : "days"}
          </span>
        </div>
      )}

      <p className="text-[11px] text-white/40 flex items-center gap-1">
        <CalendarDays className="w-3 h-3 shrink-0" />
        {fmtDate(event.due_date)}
      </p>
    </div>
  );
}

function AddModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Assignment");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onAdd({ title, type, due_date: `${date}T${time}:00` });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 space-y-5 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="font-bold text-white">Add Exam / Assignment</p>
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
            <div className="grid grid-cols-3 gap-2">
              {["Exam", "Internal Test", "Assignment"].map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${type === t ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/8 text-white/40 hover:bg-white/10"}`}>
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
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ExamCountdown() {
  const [events, setEvents] = useState(() => getManualEvents());
  const [showModal, setShowModal] = useState(false);

  function handleAdd(data) {
    setEvents(addManualEvent(data));
  }

  function handleDelete(id) {
    setEvents(deleteManualEvent(id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Exam Countdown</p>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/5">
          <Plus className="w-3 h-3" /> Add event
        </button>
      </div>

      {events.length === 0 ? (
        <button onClick={() => setShowModal(true)}
          className="w-full border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-white/20 hover:bg-white/[0.02] transition-all">
          <Plus className="w-5 h-5 text-white/20" />
          <p className="text-sm text-white/25">Add your upcoming exams and deadlines</p>
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {events.map(ev => (
            <CountdownCard key={ev.id} event={ev} onDelete={handleDelete} />
          ))}
          <button onClick={() => setShowModal(true)}
            className="flex-shrink-0 w-28 rounded-2xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] flex flex-col items-center justify-center gap-2 transition-all min-h-[180px]">
            <Plus className="w-5 h-5 text-white/20" />
            <span className="text-[11px] text-white/20">Add</span>
          </button>
        </div>
      )}

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}