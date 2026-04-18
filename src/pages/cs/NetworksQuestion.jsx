import { getNextNetworksQuestion, advanceNetworksIndex } from "@/lib/csNetworksBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function NetworksQuestion() {
  const { question, idx, total } = getNextNetworksQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceNetworksIndex} />;
}