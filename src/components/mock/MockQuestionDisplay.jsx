/**
 * MockQuestionDisplay — renders a single question's content:
 * question_number, question_text (with markdown table support),
 * diagram_description box, and graph_data chart.
 */
import ReactMarkdown from "react-markdown";
import MockGraphRenderer from "./MockGraphRenderer";

export default function MockQuestionDisplay({ question }) {
  if (!question) return null;
  const { question_number, question_text, diagram_description, graph_data, image_url } = question;

  return (
    <div className="space-y-4">
      {/* Question number badge */}
      {question_number && (
        <span className="inline-block font-mono text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
          {question_number}
        </span>
      )}

      {/* Diagram description box */}
      {diagram_description && (
        <div className="bg-blue-950/40 border border-blue-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">📊</span>
          <p className="text-sm text-blue-200/85 leading-relaxed italic">
            <span className="not-italic font-semibold text-blue-300">Diagram: </span>
            {diagram_description}
          </p>
        </div>
      )}

      {/* Image */}
      {image_url && (
        <img
          src={image_url}
          alt={diagram_description || "Question diagram"}
          className="w-full rounded-lg border border-border/60 object-contain max-h-72"
          style={{ background: "#fff" }}
        />
      )}

      {/* Graph */}
      {graph_data && (
        <div className="bg-secondary/50 border border-border rounded-xl p-3">
          <MockGraphRenderer graphData={graph_data} />
        </div>
      )}

      {/* Question text — supports markdown tables */}
      {question_text && (
        <div className="prose prose-sm prose-invert max-w-none text-[15px] leading-relaxed text-foreground/90">
          <ReactMarkdown
            components={{
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-sm border-collapse border border-border/50">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border/50 px-3 py-2 bg-secondary text-foreground text-left font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-border/50 px-3 py-2 text-foreground/80">{children}</td>
              ),
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
            }}
          >
            {question_text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}