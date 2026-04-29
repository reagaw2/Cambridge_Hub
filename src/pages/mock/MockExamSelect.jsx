/**
 * MockExamSelect — lists papers from the ExamPaper entity.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, FileText, Play, User, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MockExamSelect() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.ExamPaper.list("-created_date", 50).then(p => {
      setPapers(p);
      if (p.length > 0) setSelected(p[0]);
      setLoading(false);
    });
  }, []);

  function handleBegin() {
    if (!selected) return;
    navigate("/mock/session", { state: { paper: selected } });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[600px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Mock Exam Mode</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6">
          <div>
            <p className="text-xl font-serif font-semibold text-foreground">Select a paper</p>
            <p className="text-sm text-muted-foreground mt-1">Full timed simulation with self-marking results.</p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : papers.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No exam papers available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {papers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left bg-card border rounded-xl p-5 space-y-3 transition-all hover:brightness-105 ${
                    selected?.id === p.id
                      ? "border-primary/60 ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="font-bold text-foreground text-sm leading-tight">{p.paper_title}</p>
                    </div>
                    {selected?.id === p.id && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {p.examiner && (
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.examiner}</span>
                    )}
                    {p.date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>
                    )}
                    {p.duration_minutes && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration_minutes} min</span>
                    )}
                    {p.total_marks && (
                      <span className="font-semibold text-foreground/70">{p.total_marks} marks</span>
                    )}
                    <span className="text-muted-foreground/50">{p.questions?.length ?? 0} sub-questions</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-auto pb-4">
              <button
                onClick={handleBegin}
                className="w-full bg-primary text-primary-foreground font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Exam — {selected.paper_title}
              </button>
              <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
                Timer starts immediately. You can self-mark at the end.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}