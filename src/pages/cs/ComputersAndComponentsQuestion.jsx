import { getNextCompQuestion, advanceCompIndex } from "@/lib/csCompAndCompBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function ComputersAndComponentsQuestion() {
  const { question, idx, total } = getNextCompQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceCompIndex} />;
}