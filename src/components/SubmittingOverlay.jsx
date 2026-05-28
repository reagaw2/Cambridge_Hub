import { createPortal } from "react-dom";

export default function SubmittingOverlay({ timedOut = false }) {
  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="bg-[#0d0d1a]/80 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <div className="flex flex-col items-center gap-4 text-center max-w-xs">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-primary/20" style={{ borderWidth: 3, borderStyle: "solid" }} />
          <div
            className="absolute inset-0 rounded-full border-primary animate-spin"
            style={{
              borderWidth: 3,
              borderStyle: "solid",
              borderTopColor: "hsl(var(--primary))",
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
            }}
          />
        </div>
        {timedOut ? (
          <>
            <p className="text-sm font-semibold text-foreground/70">Taking a little longer…</p>
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              Running a faster mark check — full feedback will be available shortly.
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-foreground/70">Marking…</p>
        )}
      </div>
    </div>,
    document.body
  );
}