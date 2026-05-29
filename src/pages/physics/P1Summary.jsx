import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, Home } from "lucide-react";

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
  const { state } = useLocation();
  const { answers = {}, questions = [], paperId } = state ?? {};

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = Object.values(answers).filter(a => a.correct).length;
  const pct = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  // Build per-topic stats
  const topicMap = {};
  questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total++;
    if (answers[q.id]?.correct) topicMap[q.topic].correct++;
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

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/physics")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold text-foreground">Paper Complete</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-5 pb-8">

          {/* Hero score */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{paperId}</p>
            <p className="text-5xl font-black tabular-nums text-foreground">
              {totalCorrect}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
            </p>
            <p className="text-2xl font-bold text-primary">{pct}%</p>
            <p className={`text-sm font-semibold ${gradeColor}`}>{grade}</p>
            <p className="text-xs text-muted-foreground">{totalAnswered} of {questions.length} questions answered</p>
          </div>

          {/* Per-topic breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topics — Weakest First</p>
            {topicsSorted.map(([topic, { correct, total }]) => (
              <TopicRow key={topic} topic={topic} correct={correct} total={total} />
            ))}
          </div>

          {/* Per-question breakdown */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">All Questions</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => {
                const a = answers[q.id];
                const isCorrect = a?.correct;
                const isAnswered = !!a;
                return (
                  <div
                    key={q.id}
                    title={`Q${q.number}: ${q.topic}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border ${
                      !isAnswered
                        ? "bg-secondary border-border text-muted-foreground/40"
                        : isCorrect
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}
                  >
                    {q.number}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/physics/p1")}
              className="flex items-center justify-center gap-2 border border-border text-muted-foreground text-sm font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button
              onClick={() => navigate("/physics")}
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