/**
 * StreamingFeedbackOverlay — shown immediately after submit.
 * Streams the AI response in real time so the user sees it typing out.
 * Once complete, calls onComplete(feedback) so the parent can navigate.
 */
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function StreamingFeedbackOverlay({ streamText, isStreaming, feedback, error, onComplete, marksTotal }) {
  const calledRef = useRef(false);

  // Once feedback is ready, wait a beat then hand off
  useEffect(() => {
    if (feedback && !calledRef.current) {
      calledRef.current = true;
      // Small delay so user can see the complete response before navigating
      setTimeout(() => onComplete(feedback), 600);
    }
  }, [feedback, onComplete]);

  // Parse partial marks_earned from stream for live score badge
  let liveScore = null;
  if (streamText) {
    const m = streamText.match(/"marks_earned"\s*:\s*(\d+)/);
    if (m) liveScore = parseInt(m[1], 10);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex justify-center overflow-y-auto">
      <div className="w-full max-w-[480px] flex flex-col p-4 pt-10 gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              {isStreaming ? "Marking your answer…" : "Marking complete"}
            </p>
            {liveScore !== null && marksTotal && (
              <p className="text-2xl font-bold text-foreground font-mono">
                {liveScore} <span className="text-sm text-muted-foreground font-normal">/ {marksTotal} marks</span>
              </p>
            )}
          </div>
          {isStreaming && (
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          )}
        </div>

        {/* Streaming text */}
        {streamText ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Cambridge Examiner Feedback
            </p>
            <StreamingMarkdown text={streamText} />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analysing your answer…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StreamingMarkdown — renders the streaming JSON text in a human-readable way.
 * Extracts feedback fields as they appear in the text.
 */
function StreamingMarkdown({ text }) {
  // Try to extract readable fields from partial JSON
  const fields = [];

  const insightMatch = text.match(/"cambridge_insight"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (insightMatch) {
    fields.push({ label: "Cambridge Insight", value: insightMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') });
  }

  const nextStepMatch = text.match(/"next_step"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (nextStepMatch) {
    fields.push({ label: "Next Step", value: nextStepMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') });
  }

  // Extract mark feedback
  const markFeedbacks = [];
  const markRegex = /"mark_(\d+)"\s*:\s*\{[^}]*"earned"\s*:\s*(true|false)[^}]*"feedback"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let mMatch;
  while ((mMatch = markRegex.exec(text)) !== null) {
    markFeedbacks.push({
      num: mMatch[1],
      earned: mMatch[2] === "true",
      feedback: mMatch[3].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
    });
  }

  if (fields.length === 0 && markFeedbacks.length === 0) {
    // Nothing parsed yet — show raw streaming text with cursor
    return (
      <p className="text-sm text-foreground/70 font-mono leading-relaxed whitespace-pre-wrap">
        {text}
        <span className="inline-block w-2 h-4 bg-primary/60 ml-0.5 animate-pulse" />
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {markFeedbacks.map(m => (
        <div key={m.num} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${m.earned ? "bg-green-500/8 text-green-300" : "bg-red-500/8 text-red-300"}`}>
          <span className="shrink-0 font-bold">{m.earned ? "✓" : "✗"}</span>
          <span className="leading-relaxed">{m.feedback}</span>
        </div>
      ))}
      {fields.map(f => (
        <div key={f.label} className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{f.label}</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{f.value}</p>
        </div>
      ))}
    </div>
  );
}