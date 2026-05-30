import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, X } from "lucide-react";

const TRACKS = [
  { id: "white", label: "White Noise",  desc: "Flat, crisp"    },
  { id: "pink",  label: "Pink Noise",   desc: "Natural, soft"  },
  { id: "brown", label: "Brown Noise",  desc: "Deep, warm"     },
];

const COMING_SOON = ["☕ Coffee Shop", "🌧 Rain", "🌊 Ocean Waves", "🌿 Forest"];

function generateBuffer(audioCtx, type) {
  const size = audioCtx.sampleRate * 4;
  const buf = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  if (type === "white") {
    for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
  } else if (type === "pink") {
    let b = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1;
      b[0] = 0.99886 * b[0] + w * 0.0555179;
      b[1] = 0.99332 * b[1] + w * 0.0750759;
      b[2] = 0.96900 * b[2] + w * 0.1538520;
      b[3] = 0.86650 * b[3] + w * 0.3104856;
      b[4] = 0.55000 * b[4] + w * 0.5329522;
      b[5] = -0.7616 * b[5] - w * 0.0168980;
      d[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + w * 0.5362) * 0.11;
      b[6] = w * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1;
      d[i] = (last + 0.02 * w) / 1.02;
      last = d[i];
      d[i] *= 3.5;
    }
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

export default function WhiteNoisePlayer() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState("white");
  const [volume, setVolume] = useState(0.3);
  const ctxRef = useRef(null);
  const srcRef = useRef(null);
  const gainRef = useRef(null);

  const stopNoise = useCallback(() => {
    try { srcRef.current?.stop(); } catch {}
    srcRef.current?.disconnect();
    srcRef.current = null;
  }, []);

  const playNoise = useCallback((trackId, vol) => {
    stopNoise();
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const src = generateBuffer(ctx, trackId);
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    srcRef.current = src;
    gainRef.current = gain;
  }, [stopNoise]);

  function toggle() {
    if (playing) { stopNoise(); setPlaying(false); }
    else { playNoise(track, volume); setPlaying(true); }
  }

  function changeTrack(id) { setTrack(id); if (playing) playNoise(id, volume); }
  function changeVolume(v) { setVolume(v); if (gainRef.current) gainRef.current.gain.value = v; }

  const currentTrack = TRACKS.find(t => t.id === track);

  return (
    <div className="relative">
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} title="Background study track"
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all shadow-lg ${
          playing
            ? "bg-purple-500/30 border-purple-400 text-purple-200 shadow-purple-500/20"
            : open
              ? "bg-white/15 border-white/30 text-white"
              : "bg-[#0d0d1a] border-white/20 text-white/50 hover:text-white hover:border-white/40"
        }`}>
        {playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Playing indicator */}
      {playing && (
        <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full w-3 h-3 animate-pulse" />
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-14 right-0 w-64 bg-[#0d0d1a] border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div>
                <p className="text-sm font-bold text-white">Background Study Track</p>
                {playing && <p className="text-[10px] text-purple-400 mt-0.5">Now playing: {currentTrack?.label}</p>}
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Track selector */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Available Tracks</p>
                {TRACKS.map(t => (
                  <button key={t.id} onClick={() => changeTrack(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      track === t.id
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                        : "bg-white/[0.03] border-white/8 text-white/50 hover:bg-white/[0.06]"
                    }`}>
                    <div className="flex items-center gap-2">
                      {track === t.id && playing && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                      <span>{t.label}</span>
                    </div>
                    <span className="text-[10px] opacity-60">{t.desc}</span>
                  </button>
                ))}
                <div className="pt-1.5 space-y-1 border-t border-white/6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-1">More Tracks — Coming Soon</p>
                  {COMING_SOON.map(name => (
                    <div key={name} className="flex items-center gap-2 px-3 py-1.5 opacity-30">
                      <span className="text-[11px] text-white/40">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Volume</p>
                  <span className="text-[11px] font-bold text-white/50">{Math.round(volume * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={volume}
                  onChange={e => changeVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full cursor-pointer accent-purple-400" />
              </div>

              {/* Play/stop */}
              <button onClick={toggle}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  playing
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
                    : "bg-white/8 border-white/15 text-white/60 hover:bg-white/12"
                }`}>
                {playing ? "⏸ Stop" : "▶ Play"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}