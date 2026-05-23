import { useEffect, useRef } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function StreamingFeedbackOverlay({ streamText, isStreaming, feedback, error, onComplete, marksTotal }) {
  const calledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Only navigate once streaming has stopped AND feedback is parsed
  useEffect(() => {
    if (!feedback || isStreaming || calledRef.current) return;
    calledRef.current = true;
    // Let the user see the completed text for 1.2s before navigating
    const t = setTimeout(() => onCompleteRef.current(feedback), 1200);
    return () => clearTimeout(t);
  }, [feedback, isStreaming]);

  // Live score from stream
  let liveScore = null;
  if (streamText) {
    const m = streamText.match(/"marks_earned"\s*:\s*(\d+)/);
    if (m) liveScore = parseInt(m[1], 10);
  }

  const isDone = !isStreaming && !!feedback;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d1a]/98 backdrop-blur-sm flex justify-center overflow-y-auto">
      <div className="w-full max-w-[480px] flex flex-col p-4 pt-8 gap-4">

        {/* Status bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              )}
              <p className="text-sm font-semibold text-foreground">
                {isStreaming ? "Marking your answer…" : "Marking complete"}
              </p>
            </div>
            {liveScore !== null && marksTotal != null && (
              <p className="text-xs text-muted-foreground pl-6">
                Score: <span className="font-bold text-primary">{liveScore} / {marksTotal}</span>
              </p>
            )}
          </div>
          {isDone && (
            <p className="text-[11px] text-muted-foreground/60 animate-pulse">Redirecting…</p>
          )}
        </div>

        {/* Stream content */}
        {streamText ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 min-h-[120px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Examiner Feedback
            </p>
            <StreamingView text={streamText} />
          </div>
        ) : !error ? (
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[120px]">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Connecting to examiner AI…</p>
          </div>
        ) : null}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StreamingView — progressively renders the JSON as human-readable feedback.
 * Falls back to raw monospace text while fields are still being written.
 */
function StreamingView({ text }) {
  const markFeedbacks = [];
  const markRegex = /"mark_(\d+)"\s*:\s*\{[^}]*?"earned"\s*:\s*(true|false)[^}]*?"feedback"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = markRegex.exec(text)) !== null) {
    markFeedbacks.push({
      num: m[1],
      earned: m[2] === "true",
      feedback: m[3].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
    });
  }

  const insightMatch = text.match(/"cambridge_insight"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const insight = insightMatch ? insightMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : null;

  const nextStepMatch = text.match(/"next_step"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const nextStep = nextStepMatch ? nextStepMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : null;

  const hasStructured = markFeedbacks.length > 0 || insight || nextStep;

  if (!hasStructured) {
    // Nothing parsed yet — show raw text with blinking cursor
    return (
      <p className="text-sm text-foreground/60 font-mono leading-relaxed whitespace-pre-wrap break-all">
        {text}
        <span className="inline-block w-[2px] h-[14px] bg-primary ml-0.5 animate-pulse align-middle" />
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {markFeedbacks.map(mk => (
        <div
          key={mk.num}
          className={`flex items-start gap-2.5 p-2.5 rounded-lg text-sm ${
            mk.earned
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}
        >
          <span className="font-bold shrink-0 mt-0.5">{mk.earned ? "✓" : "✗"}</span>
          <span className="leading-relaxed">{mk.feedback}</span>
        </div>
      ))}

      {insight && (
        <div className="space-y-1 border-l-2 border-primary/40 pl-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cambridge Insight</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
        </div>
      )}

      {nextStep && (
        <div className="space-y-1 border-l-2 border-amber-500/40 pl-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60">Next Step</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{nextStep}</p>
        </div>
      )}
    </div>
  );
}