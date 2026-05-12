/**
 * MockExamSelect — lists papers, offers Practice vs Exam mode selection.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, FileText, Play, User, Calendar, BookOpen, Timer, ShieldCheck, CalendarPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ExamStartModal from "@/components/mock/ExamStartModal";

function addToGoogleCalendar(paper) {
  // Default: schedule for tomorrow at 9am, duration = paper's duration_minutes
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const durationMs = (paper.duration_minutes ?? 60) * 60 * 1000;
  const end = new Date(tomorrow.getTime() + durationMs);

  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const title = encodeURIComponent(`Mock Exam — ${paper.paper_title}`);
  const details = encodeURIComponent(
    `Cambridge Hub practice session.\nPaper: ${paper.paper_title}${paper.examiner ? `\nExaminer: ${paper.examiner}` : ""}${paper.total_marks ? `\nTotal marks: ${paper.total_marks}` : ""}\n\nOpen app: ${window.location.origin}`
  );
  const dates = `${fmt(tomorrow)}/${fmt(end)}`;

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
  window.open(url, "_blank");
}

export default function MockExamSelect() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pausedSessions, setPausedSessions] = useState({}); // paper_id -> session
  const [showExamModal, setShowExamModal] = useState(false);

  useEffect(() => {
    async function load() {
      const [paperList, user] = await Promise.all([
        base44.entities.ExamPaper.list("-created_date", 50),
        base44.auth.me(),
      ]);
      setPapers(paperList);
      if (paperList.length > 0) setSelected(paperList[0]);

      if (user) {
        const records = await base44.entities.StudentData.filter({ user_email: user.email });
        const sessions = records[0]?.exam_sessions ?? [];
        const paused = {};
        sessions.forEach(s => {
          if (s.status === "paused" && s.paper_id) paused[s.paper_id] = s;
        });
        setPausedSessions(paused);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handlePractice() {
    if (!selected) return;
    const paused = pausedSessions[selected.paper_id];
    navigate("/mock/session", {
      state: { paper: selected, mode: "practice", resumeSession: paused ?? null }
    });
  }

  function handleExamConfirmed() {
    setShowExamModal(false);
    navigate("/mock/session", {
      state: { paper: selected, mode: "exam", resumeSession: null }
    });
  }

  const paused = selected ? pausedSessions[selected.paper_id] : null;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[640px] flex flex-col min-h-screen">

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

          {/* Integrity notice */}
          <div className="flex items-start gap-3 bg-muted/40 border border-border/60 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">🤝</span>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
              While we build integrity features (AI proctoring, screen monitoring), we're trusting you to be honest with yourself. If you want authentic evaluation, treat this like the real thing. Future updates will include proctoring similar to College Board's Bluebook.
            </p>
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
                    selected?.id === p.id ? "border-primary/60 ring-2 ring-primary/20" : "border-border"
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
                    {p.examiner && <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.examiner}</span>}
                    {p.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>}
                    {p.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration_minutes} min</span>}
                    {p.total_marks && <span className="font-semibold text-foreground/70">{p.total_marks} marks</span>}
                    <span className="text-muted-foreground/50">{p.questions?.length ?? 0} questions</span>
                    {pausedSessions[p.paper_id] && (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">⏸ Paused session</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-auto pb-4 space-y-3">
              {/* Add to Google Calendar */}
              <button
                onClick={() => addToGoogleCalendar(selected)}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground border border-border rounded-xl py-2.5 hover:bg-secondary hover:text-foreground transition-all"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Schedule in Google Calendar
              </button>
              {/* Mode cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Practice Mode */}
                <div className="bg-card border border-primary/30 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <p className="font-bold text-sm text-foreground">Practice Mode</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Pause anytime, save progress, resume later. Timer pauses when you exit.</p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    <li className="text-primary">✓ Pause &amp; resume</li>
                    <li className="text-primary">✓ Auto-save</li>
                    <li className="text-primary">✓ Exit anytime</li>
                  </ul>
                  <button
                    onClick={handlePractice}
                    className="mt-auto w-full bg-primary/15 border border-primary/40 text-primary font-semibold text-xs py-2.5 rounded-lg hover:bg-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {paused ? "Resume Practice" : "Start Practice"}
                  </button>
                </div>

                {/* Exam Mode */}
                <div className="bg-card border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-400" />
                    <p className="font-bold text-sm text-foreground">Exam Mode</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Simulates real exam conditions. Exiting counts as submission.</p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    <li className="text-red-400">✗ No pausing</li>
                    <li className="text-red-400">✗ Exit = submission</li>
                    <li className="text-primary">✓ Retake allowed</li>
                  </ul>
                  <button
                    onClick={() => setShowExamModal(true)}
                    className="mt-auto w-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-semibold text-xs py-2.5 rounded-lg hover:bg-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Start Exam
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showExamModal && selected && (
        <ExamStartModal
          paper={selected}
          onConfirm={handleExamConfirmed}
          onCancel={() => setShowExamModal(false)}
        />
      )}
    </div>
  );
}