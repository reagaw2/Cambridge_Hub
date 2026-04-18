import { getNextDataSecurityQuestion, advanceDataSecurityIndex } from "@/lib/csDataSecurityBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataSecurityQuestion() {
  const { question, idx, total } = getNextDataSecurityQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceDataSecurityIndex} />;
}