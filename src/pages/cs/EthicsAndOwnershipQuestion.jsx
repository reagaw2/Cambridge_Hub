import { getNextEthicsQuestion, advanceEthicsIndex } from "@/lib/csEthicsBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function EthicsAndOwnershipQuestion() {
  const { question, idx, total } = getNextEthicsQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceEthicsIndex} />;
}