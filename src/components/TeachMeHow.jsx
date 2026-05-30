import { Sparkles } from "lucide-react";

export default function TeachMeHow({ onClose }) {
  return (
    <div className="space-y-4">
      {/* Coming soon card */}
      <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-5 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">Teach Me How</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            This guided learning feature is coming soon. For now, submit your best attempt — the AI feedback will walk you through exactly what Cambridge expects.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-primary/70 hover:text-primary transition-colors mt-1"
        >
          ← Back to answer box
        </button>
      </div>
    </div>
  );
}