import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DataRepresentationQuestion() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Computer Science</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">9618</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-4xl">💾</span>
          <p className="text-lg font-semibold text-foreground">Data Representation</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Questions for this topic are being prepared. Check back soon.
          </p>
          <button onClick={() => navigate("/cs")} className="text-sm text-blue-400 hover:brightness-110 mt-2">
            ← Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}