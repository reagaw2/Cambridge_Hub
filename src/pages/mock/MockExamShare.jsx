/**
 * MockExamShare — public read-only page for shared mock exam results.
 * Accessed via /mock/share?r=<base64-encoded-summary>
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, Star, ArrowRight } from "lucide-react";

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

export default function MockExamShare() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("r");
      if (!encoded) throw new Error("No data");
      const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
      setResult(decoded);
    } catch {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Invalid or expired share link.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const perfLabel =
    result.pct >= 80 ? "Excellent" :
    result.pct >= 60 ? "Good effort" :
    result.pct >= 40 ? "Keep practising" : "Needs more work";

  const perfColor =
    result.pct >= 80 ? "text-emerald-400" :
    result.pct >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-6">

        {/* Branding */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-2">
            <Star className="w-3 h-3 text-purple-400" />
            Cambridge Hub — Shared Result
          </div>
          <p className="text-xs text-muted-foreground">A peer shared their mock exam result with you</p>
        </div>

        {/* Result card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">{result.title}</p>
              {result.date && <p className="text-[11px] text-muted-foreground mt-0.5">{result.date}</p>}
            </div>
          </div>

          {/* Score */}
          <div className="text-center py-4 border-y border-border/50">
            <p className={`text-5xl font-extrabold tabular-nums ${perfColor}`}>{result.pct}%</p>
            <p className="text-base text-muted-foreground mt-1">
              {result.score} / {result.total} marks
            </p>
            <p className={`text-sm font-semibold mt-1 ${perfColor}`}>{perfLabel}</p>
          </div>

          {/* Time */}
          {result.time > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Completed in <span className="font-semibold text-foreground">{formatTime(result.time)}</span></span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary/8 border border-primary/25 rounded-2xl p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Think you can beat this score?</p>
          <p className="text-xs text-muted-foreground">Try the same paper on Cambridge Hub</p>
          <button
            onClick={() => navigate("/mock/select")}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Start Practising <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}