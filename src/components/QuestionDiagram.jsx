/**
 * QuestionDiagram — renders an inline SVG diagram for a CS question.
 * The SVG is trusted (authored in ingestorQuestions.js), not user-generated.
 */
export default function QuestionDiagram({ svgString }) {
  if (!svgString) return null;
  return (
    <div
      className="my-3 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}