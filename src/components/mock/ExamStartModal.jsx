/**
 * ExamStartModal — pre-start warning shown before entering Exam Mode.
 */
export default function ExamStartModal({ paper, onConfirm, onCancel }) {
  const duration = paper?.duration_minutes ?? 120;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-card border border-amber-500/40 rounded-2xl p-6 space-y-5 w-full max-w-sm shadow-2xl">
        <div>
          <p className="text-lg font-bold text-foreground">⚠️ Before you start</p>
          <p className="text-xs text-amber-400 font-semibold mt-0.5">{paper.paper_title}</p>
        </div>

        <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
          <p>Exam mode simulates real Cambridge exam conditions. Once you begin:</p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 shrink-0 mt-0.5">•</span>
              <span>The timer runs <strong>continuously</strong> — it will NOT pause if you leave this tab or app.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 shrink-0 mt-0.5">•</span>
              <span>Exiting or closing the app counts as <strong>submission</strong> — your answers will be submitted immediately.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 shrink-0 mt-0.5">•</span>
              <span>Find a quiet place where you won't be interrupted for the full <strong>{duration} minutes</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 shrink-0 mt-0.5">•</span>
              <span>Make sure your device is <strong>charged or plugged in</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="border border-border text-muted-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-amber-500 text-black font-bold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
          >
            I'm ready — Start
          </button>
        </div>
      </div>
    </div>
  );
}