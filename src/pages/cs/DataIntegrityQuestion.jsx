import { getNextDataIntegrityQuestion, advanceDataIntegrityIndex } from "@/lib/csDataIntegrityBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataIntegrityQuestion() {
  const { question, idx, total } = getNextDataIntegrityQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceDataIntegrityIndex} />;
}