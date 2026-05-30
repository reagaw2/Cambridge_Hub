import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, RotateCcw, Play, Pause, X, Settings, Check } from "lucide-react";

const DEFAULT_SETTINGS = { work: 25, short: 5, long: 15 };
const SETTINGS_KEY = "pomodoro_settings_v1";

function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") }; } catch { return DEFAULT_SETTINGS; }
}
function saveSettings(s) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {} }

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
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [draftSettings, setDraftSettings] = useState(loadSettings);
  const [modeKey, setModeKey] = useState("work");
  const [timeLeft, setTimeLeft] = useState(() => loadSettings().work * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const modes = [
    { key: "work",  label: "Focus",        mins: settings.work,  color: "#f87171" },
    { key: "short", label: "Short Break",  mins: settings.short, color: "#34d399" },
    { key: "long",  label: "Long Break",   mins: settings.long,  color: "#60a5fa" },
  ];
  const mode = modes.find(m => m.key === modeKey) ?? modes[0];

  const onTick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setRunning(false);
        if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        beep(audioRef.current);
        if (modeKey === "work") setDone(d => d + 1);
        return 0;
      }
      return prev - 1;
    });
  }, [modeKey]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running) intervalRef.current = setInterval(onTick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, onTick]);

  function selectMode(key) {
    clearInterval(intervalRef.current);
    setModeKey(key);
    const m = modes.find(m => m.key === key);
    setTimeLeft((m?.mins ?? 25) * 60);
    setRunning(false);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setTimeLeft(mode.mins * 60);
    setRunning(false);
  }

  function applySettings() {
    const clamped = {
      work: Math.max(1, Math.min(120, draftSettings.work)),
      short: Math.max(1, Math.min(60, draftSettings.short)),
      long: Math.max(1, Math.min(60, draftSettings.long)),
    };
    setSettings(clamped);
    saveSettings(clamped);
    // Reset current timer to new duration
    clearInterval(intervalRef.current);
    setRunning(false);
    const currentMins = clamped[modeKey] ?? 25;
    setTimeLeft(currentMins * 60);
    setShowSettings(false);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const total = mode.mins * 60;
  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ * (timeLeft / total);

  return (
    <div className="relative">
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} title="Pomodoro timer"
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all shadow-lg ${
          running
            ? "bg-rose-500/30 border-rose-400 text-rose-200 shadow-rose-500/20"
            : open
              ? "bg-white/15 border-white/30 text-white"
              : "bg-[#0d0d1a] border-white/20 text-white/50 hover:text-white hover:border-white/40"
        }`}>
        <Timer className="w-4 h-4" />
      </button>

      {/* Running indicator pill */}
      {running && (
        <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full w-4 h-4 flex items-center justify-center">
          <span className="text-[8px] font-black text-white">{mins}</span>
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowSettings(false); }} />
          <div className="absolute bottom-14 right-0 w-72 bg-[#0d0d1a] border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" style={{ color: mode.color }} />
                <p className="text-sm font-bold text-white">Pomodoro Timer</p>
              </div>
              <div className="flex items-center gap-1">
                {done > 0 && (
                  <div className="flex items-center gap-0.5 bg-white/8 rounded-full px-2 py-0.5">
                    <span className="text-xs">🍅</span>
                    <span className="text-xs font-bold text-white">{done}</span>
                  </div>
                )}
                <button onClick={() => setShowSettings(s => !s)}
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-white/15 text-white" : "hover:bg-white/8 text-white/40 hover:text-white"}`}>
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setOpen(false); setShowSettings(false); }} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showSettings ? (
              /* Settings panel */
              <div className="p-4 space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Customize Durations (minutes)</p>
                {[
                  { key: "work", label: "Focus", color: "#f87171", max: 120 },
                  { key: "short", label: "Short Break", color: "#34d399", max: 60 },
                  { key: "long", label: "Long Break", color: "#60a5fa", max: 60 },
                ].map(({ key, label, color, max }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/60">{label}</label>
                      <span className="text-sm font-black tabular-nums" style={{ color }}>{draftSettings[key]}m</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={max}
                      value={draftSettings[key]}
                      onChange={e => setDraftSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                      className="w-full h-2 rounded-full cursor-pointer"
                      style={{ accentColor: color }}
                    />
                    <div className="flex justify-between text-[10px] text-white/20">
                      <span>1m</span>
                      <span>{max}m</span>
                    </div>
                  </div>
                ))}
                <button onClick={applySettings}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-white/15 transition-all">
                  <Check className="w-4 h-4" /> Apply & Reset Timer
                </button>
              </div>
            ) : (
              /* Timer panel */
              <div className="p-4 space-y-4">
                {/* Mode tabs */}
                <div className="flex gap-1">
                  {modes.map((m) => (
                    <button key={m.key} onClick={() => selectMode(m.key)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        modeKey === m.key
                          ? "text-white border-white/20 bg-white/10"
                          : "text-white/30 border-white/8 hover:bg-white/5"
                      }`}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Circle */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="50" cy="50" r={R} fill="none" stroke={mode.color} strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={circ - offset}
                        style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-black tabular-nums text-white leading-none">
                        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                      </p>
                      <p className="text-[11px] text-white/40 mt-1">{mode.label} · {mode.mins}m</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={reset}
                      className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:bg-white/8 hover:text-white/70 transition-all">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setRunning(r => !r)}
                      className="flex items-center justify-center w-14 h-14 rounded-full border-2 font-black transition-all"
                      style={{ borderColor: mode.color, color: mode.color, background: mode.color + "22" }}>
                      {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-white/20 text-center">A bell rings when time is up · Tap ⚙ to customize</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}