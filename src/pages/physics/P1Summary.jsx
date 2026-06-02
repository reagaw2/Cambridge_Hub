import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, RotateCcw, Timer, Trophy, Calendar } from "lucide-react";
import P1TopicBars from "@/components/P1TopicBars";
import { loadExamResults } from "@/lib/p1ExamResultsStore";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TopicRow({ topic, correct, total }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const color = pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-foreground/80 font-medium">{topic}</span>
        <span className="font-mono text-muted-foreground">{correct}/{total} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function P1Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers = {}, questions = [], paperId, examMode } = location.state ?? {};

  const [pastResults, setPastResults] = useState([]);

  useEffect(() => {
    if (examMode) {
      loadExamResults().then(all => {
        // Show all results for this paper except the very latest (already shown above)
        const forPaper = all.filter(r => r.paperId === paperId);
        setPastResults(forPaper);
      });
    }
  }, [examMode, paperId]);

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = Object.values(answers).filter(a => a.correct && !a.flagged_as_guess).length;
  const pct = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  const topicMap = {};
  questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total++;
    if (answers[q.id]?.correct && !answers[q.id]?.flagged_as_guess) topicMap[q.topic].correct++;
  });
  const topicsSorted = Object.entries(topicMap).sort((a, b) => {
    const pA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
    const pB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
    return pA - pB;
  });

  const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Satisfactory" : "Needs Work";
  const gradeColor = pct >= 80 ? "text-green-400" : pct >= 65 ? "text-primary" : pct >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-b border-border/50">
          <span className="text-base font-bold tracking-wide text-foreground">Paper Complete</span>
          {examMode && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
              <Timer className="w-3 h-3" /> Timed Exam
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-5 pb-8">

          {/* Hero score */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
            {examMode && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-1">Timed Exam Result — Saved ✓</p>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{paperId}</p>
            <p className="text-5xl font-black tabular-nums text-foreground">
              {totalCorrect}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
            </p>
            <p className="text-2xl font-bold text-primary">{pct}%</p>
            <p className={`text-sm font-semibold ${gradeColor}`}>{grade}</p>
            <p className="text-xs text-muted-foreground">{totalAnswered} of {questions.length} questions answered</p>
            {examMode && (
              <p className="text-[11px] text-amber-400/70 mt-1">
                {questions.length - totalAnswered > 0
                  ? `${questions.length - totalAnswered} question${questions.length - totalAnswered !== 1 ? "s" : ""} left blank`
                  : "All questions answered ✓"}
              </p>
            )}
          </div>

          {/* Per-topic breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topics — Weakest First</p>
            {topicsSorted.map(([topic, { correct, total }]) => (
              <TopicRow key={topic} topic={topic} correct={correct} total={total} />
            ))}
          </div>

          {/* Per-question grid */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">All Questions</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q) => {
                const a = answers[q.id];
                const isCorrect = a?.correct && !a?.flagged_as_guess;
                const isGuessed = a?.flagged_as_guess;
                const isAnswered = !!a;
                return (
                  <div key={q.id} title={`Q${q.number}: ${q.topic}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border ${
                      !isAnswered ? "bg-secondary border-border text-muted-foreground/40"
                      : isGuessed ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : isCorrect ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}>
                    {q.number}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-[10px] text-muted-foreground mt-2 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500/60 inline-block" />Correct</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/60 inline-block" />Incorrect</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/60 inline-block" />Guess</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-secondary border border-border inline-block" />Blank</span>
            </div>
          </div>

          {/* Past exam attempts for this paper */}
          {examMode && pastResults.length > 1 && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">All Exam Attempts — {paperId}</p>
              </div>
              <div className="space-y-2">
                {pastResults.map((r, i) => {
                  const isLatest = i === 0;
                  return (
                    <div key={r.resultId} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border ${isLatest ? "border-primary/30 bg-primary/8" : "border-border/40 bg-secondary/20"}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        {isLatest && <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/20 px-1.5 py-0.5 rounded-full shrink-0">Latest</span>}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span>{fmtDate(r.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-muted-foreground font-mono">{r.score}/{r.total}</span>
                        <span className={`text-sm font-black tabular-nums ${r.pct >= 70 ? "text-green-400" : r.pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {r.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            {!examMode && (
              <button onClick={() => navigate("/physics/p1", { state: { paperId } })}
                className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
            )}
            {examMode && (
              <button onClick={() => navigate("/physics")}
                className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
                <RotateCcw className="w-4 h-4" /> Practice Mode
              </button>
            )}
            <button onClick={() => navigate("/physics")}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
              <Home className="w-4 h-4" /> Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}