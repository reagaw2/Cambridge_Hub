import QuestionMedia from "./QuestionMedia";

export default function QuestionCard({
  label = "Question 1(b)(i)",
  topic = "Gravitational Fields",
  text = "Describe the gravitational field in the region close to the surface of a planet.",
  marks = "[2 marks]",
  question = null, // full question object for media rendering
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
          {label}
        </span>
      </div>
      <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
        {topic}
      </span>
      {question && <QuestionMedia question={question} />}
      <p className="text-[15px] leading-relaxed text-foreground/90">{text}</p>
      <div className="flex justify-end">
        <span className="font-mono text-xs text-muted-foreground">{marks}</span>
      </div>
    </div>
  );
}