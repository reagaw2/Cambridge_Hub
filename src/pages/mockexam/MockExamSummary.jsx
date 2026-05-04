/**
 * MockExamSummary — shows total score, per-question breakdown, and topic analysis.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, Home, RotateCcw } from "lucide-react";

function TopicRow({ topic, earned, available }) {
  const pct = available > 0 ? Math.round((earned / available) * 100) : 0;
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-foreground/80 font-medium">{topic}</span>
        <span className="font-mono text-muted-foreground">{earned}/{available} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MockExamSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { paperId, questions = [], scores = [] } = state ?? {};

  const totalMarks = questions.reduce((s, q) => s + q.total_marks, 0);
  const totalEarned = scores.reduce((s, v) => s + v, 0);
  const pct = totalMarks > 0 ? Math.round((totalEarned / totalMarks) * 100) : 0;

  // Build per-topic summary
  const topicMap = {};
  questions.forEach((q, i) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { earned: 0, available: 0 };
    topicMap[q.topic].earned += scores[i] ?? 0;
    topicMap[q.topic].available += q.total_marks;
  });
  const topicsSorted = Object.entries(topicMap).sort((a, b) => {
    const pA = a[1].available > 0 ? a[1].earned / a[1].available : 0;
    const pB = b[1].available > 0 ? b[1].earned / b[1].available : 0;
    return pA - pB; // weakest first
  });

  const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Satisfactory" : "Needs Work";
  const gradeColor = pct >= 80 ? "text-green-400" : pct >= 65 ? "text-primary" : pct >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-border/50">
          <span className="text-base font-bold tracking-wide text-foreground">Paper Complete</span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-5 pb-8">

          {/* Hero score */}
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Final Score</p>
            <p className="text-5xl font-bold text-foreground font-mono">{totalEarned}<span className="text-2xl text-muted-foreground">/{totalMarks}</span></p>
            <p className="text-2xl font-bold text-primary">{pct}%</p>
            <p className={`text-sm font-semibold ${gradeColor}`}>{grade}</p>
          </div>

          {/* Per-topic breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topics — Weakest First</p>
            {topicsSorted.map(([topic, { earned, available }]) => (
              <TopicRow key={topic} topic={topic} earned={earned} available={available} />
            ))}
          </div>

          {/* Per-question list */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question Breakdown</p>
            {questions.map((q, i) => {
              const s = scores[i] ?? 0;
              const full = s >= q.total_marks;
              return (
                <div key={q.id} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                  {full
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-primary mr-2">{q.question_number}</span>
                    <span className="text-xs text-muted-foreground">{q.topic}</span>
                  </div>
                  <span className="font-mono text-xs text-foreground shrink-0">{s}/{q.total_marks}</span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/mock-exam/session", { state: { paperId } })}
              className="flex items-center justify-center gap-2 border border-border text-muted-foreground text-sm font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Retry Paper
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}