import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, RotateCcw, Play, Pause, X } from "lucide-react";

const MODES = [
  { key: "work",  label: "Focus",       mins: 25, color: "#f87171" },
  { key: "short", label: "Short Break", mins: 5,  color: "#34d399" },
  { key: "long",  label: "Long Break",  mins: 15, color: "#60a5fa" },
];

function beep(ctx) {
  [[880, 0], [1100, 0.3], [880, 0.6]].forEach(([freq, t]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.45);
    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.45);
  });
}

export default function PomodoroTimer() {
  const [open, setOpen] = useState(false);
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].mins * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const mode = MODES[modeIdx];

  const onTick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setRunning(false);
        if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        beep(audioRef.current);
        if (MODES[modeIdx].key === "work") setDone(d => d + 1);
        return 0;
      }
      return prev - 1;
    });
  }, [modeIdx]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running) intervalRef.current = setInterval(onTick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, onTick]);

  function selectMode(idx) {
    clearInterval(intervalRef.current);
    setModeIdx(idx);
    setTimeLeft(MODES[idx].mins * 60);
    setRunning(false);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setTimeLeft(mode.mins * 60);
    setRunning(false);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const total = mode.mins * 60;
  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ * (timeLeft / total);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} title="Pomodoro timer"
        className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all ${
          running
            ? "bg-rose-500/25 border-rose-500/50 text-rose-300"
            : "bg-white/5 border-white/15 text-white/40 hover:text-white/60 hover:bg-white/10"
        }`}>
        <Timer className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 right-0 w-64 bg-[#0d0d1a] border border-white/15 rounded-2xl shadow-2xl p-5 space-y-4 z-50">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-3.5 h-3.5" style={{ color: mode.color }} />
                <p className="text-xs font-bold text-white">Pomodoro</p>
              </div>
              <div className="flex items-center gap-2">
                {done > 0 && (
                  <span className="text-[11px]">{Array(Math.min(done, 6)).fill("🍅").join("")}</span>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/8">
                  <X className="w-3 h-3 text-white/40" />
                </button>
              </div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1">
              {MODES.map((m, i) => (
                <button key={m.key} onClick={() => selectMode(i)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    modeIdx === i
                      ? "text-white border-white/20 bg-white/10"
                      : "text-white/30 border-white/8 hover:bg-white/5"
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Circle */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle cx="50" cy="50" r={R} fill="none" stroke={mode.color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ - offset}
                    style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-black tabular-nums text-white leading-none">
                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">{mode.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={reset}
                  className="p-2 rounded-xl border border-white/10 text-white/40 hover:bg-white/8 hover:text-white/70 transition-all">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setRunning(r => !r)}
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 font-black transition-all"
                  style={{ borderColor: mode.color, color: mode.color, background: mode.color + "22" }}>
                  {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-white/20 text-center">A bell rings when time is up.</p>
          </div>
        </>
      )}
    </div>
  );
}