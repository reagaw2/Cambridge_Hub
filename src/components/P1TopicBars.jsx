/**
 * P1TopicBars — shows per-topic score bars sorted weakest → strongest.
 * Used inside the P1 Question Overview panel.
 */
export default function P1TopicBars({ questions, answers }) {
  const topicsData = [...new Set(questions.map(q => q.topic))].map(topic => {
    const topicQs = questions.filter(q => q.topic === topic);
    const answered = topicQs.filter(q => answers[q.id]?.chosen);
    const correct = answered.filter(q => answers[q.id]?.correct).length;
    const pct = answered.length > 0 ? (correct / answered.length) * 100 : null;
    return { topic, total: topicQs.length, answered: answered.length, correct, pct };
  }).sort((a, b) => {
    // Unanswered topics go to the bottom
    if (a.pct === null && b.pct === null) return 0;
    if (a.pct === null) return 1;
    if (b.pct === null) return -1;
    return a.pct - b.pct; // weakest first
  });

  return (
    <div className="space-y-3 pt-1 border-t border-border/40">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Topics — Weakest First
      </p>
      {topicsData.map(({ topic, total, answered, correct, pct }) => {
        const barColor =
          pct === null ? "bg-border/40"
          : pct >= 80   ? "bg-green-500"
          : pct >= 50   ? "bg-amber-500"
          : "bg-red-500";

        const textColor =
          pct === null ? "text-muted-foreground/40"
          : pct >= 80   ? "text-green-400"
          : pct >= 50   ? "text-amber-400"
          : "text-red-400";

        return (
          <div key={topic} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-foreground/80 truncate flex-1">{topic}</span>
              <span className={`text-[11px] font-mono font-semibold shrink-0 ${textColor}`}>
                {answered > 0
                  ? `${correct}/${answered} (${Math.round(pct!)}%)`
                  : `0/${total}`}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-700`}
                style={{ width: pct !== null ? `${pct}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}