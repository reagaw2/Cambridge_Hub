import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generateQuestionReviewPdf } from "@/lib/questionReviewPdf";

/**
 * DownloadQuestionPdf
 *
 * Drop into any feedback screen.
 *
 * Props:
 *   question   { text, topic, total_marks, paper_ref, label, options?, correct? }
 *   answer     string
 *   feedback   AI feedback object (any format)
 *   layer2     optional deeper analysis
 *   subject    "physics" | "cs"
 *   userEmail  optional
 *   compact    boolean — smaller single-line style for inline use
 */
export default function DownloadQuestionPdf({
  question,
  answer,
  feedback,
  layer2 = null,
  subject = "physics",
  userEmail = "",
  compact = false,
}) {
  const [loading, setLoading] = useState(false);

  if (!feedback) return null;

  async function handleDownload() {
    if (loading) return;
    setLoading(true);
    try {
      await generateQuestionReviewPdf({ question, answer, feedback, layer2, subject, userEmail });
    } catch (e) {
      console.error("[DownloadQuestionPdf]", e);
    }
    setLoading(false);
  }

  if (compact) {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        title="Download Question Review PDF"
        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground border border-border/40 hover:border-border bg-secondary/20 hover:bg-secondary px-3 py-2 rounded-lg transition-all disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        {loading ? "Generating…" : "Download Review"}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 border border-border/50 bg-secondary/30 text-muted-foreground/70 hover:text-foreground hover:bg-secondary hover:border-border text-xs font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating PDF…</>
        : <><Download className="w-3.5 h-3.5" />Download Question Review (PDF)</>}
    </button>
  );
}