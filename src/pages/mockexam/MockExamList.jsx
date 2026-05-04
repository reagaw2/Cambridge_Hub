/**
 * MockExamList — lists available mock papers for the student to choose from.
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Clock, ChevronRight } from "lucide-react";
import { MOCK_PAPERS } from "@/lib/mockExamPapers";

export default function MockExamList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Mock Exams</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6">
          <div>
            <p className="text-xl font-serif font-semibold text-foreground">Choose a paper</p>
            <p className="text-sm text-muted-foreground mt-1">
              Work through every sub-part in order. Get instant AI feedback after each one.
            </p>
          </div>

          <div className="space-y-3">
            {MOCK_PAPERS.map(paper => {
              const totalMarks = paper.questions.reduce((s, q) => s + q.total_marks, 0);
              const totalQ = paper.questions.length;
              return (
                <button
                  key={paper.id}
                  onClick={() => navigate("/mock-exam/session", { state: { paperId: paper.id } })}
                  className="w-full text-left bg-card border border-border rounded-xl p-5 hover:brightness-105 active:scale-[0.99] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="font-bold text-foreground text-sm">{paper.displayName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{paper.estimatedMinutes} min
                    </span>
                    <span>{totalQ} sub-questions</span>
                    <span>{totalMarks} marks total</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(paper.questions.map(q => q.topic))].slice(0, 5).map(t => (
                      <span key={t} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}