import { getNextCompressionQuestion, advanceCompressionIndex } from "@/lib/csCompressionBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function CompressionQuestion() {
  const { question, idx, total } = getNextCompressionQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceCompressionIndex} />;
}