import { getNextDataRepQuestion, advanceDataRepIndex } from "@/lib/csDataRepBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataRepresentationQuestion() {
  const { question, idx, total } = getNextDataRepQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceDataRepIndex} />;
}