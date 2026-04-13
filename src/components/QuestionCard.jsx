export default function QuestionCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Question label */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
          Question 1(b)(i)
        </span>
      </div>

      {/* Topic tag */}
      <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
        Gravitational Fields
      </span>

      {/* Question text */}
      <p className="text-[15px] leading-relaxed text-foreground/90">
        Describe the gravitational field in the region close to the surface of a planet.
      </p>

      {/* Marks indicator */}
      <div className="flex justify-end">
        <span className="font-mono text-xs text-muted-foreground">
          [2 marks]
        </span>
      </div>
    </div>
  );
}