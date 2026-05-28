import { getNextEthicsQuestion, advanceEthicsIndex, ETHICS_QUESTIONS } from "@/lib/csEthicsBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function EthicsAndOwnershipQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="ethics_and_ownership"
      topicLabel="Ethics and Ownership"
      route="/cs/ethics-and-ownership/question"
      fallbackQuestions={ETHICS_QUESTIONS}
      fallbackGetNext={getNextEthicsQuestion}
      fallbackAdvance={advanceEthicsIndex}
    />
  );
}