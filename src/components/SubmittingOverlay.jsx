import { createPortal } from "react-dom";

export default function SubmittingOverlay() {
  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="bg-[#0d0d1a]/80 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-primary/20" style={{ borderWidth: 3 }} />
          <div className="absolute inset-0 rounded-full border-primary animate-spin" style={{ borderWidth: 3, borderTopColor: "hsl(var(--primary))", borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent" }} />
        </div>
        <p className="text-sm font-semibold text-foreground/70">Marking…</p>
      </div>
    </div>,
    document.body
  );
}