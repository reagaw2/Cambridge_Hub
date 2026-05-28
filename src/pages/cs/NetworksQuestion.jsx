import { getNextNetworksQuestion, advanceNetworksIndex, NETWORKS_QUESTIONS } from "@/lib/csNetworksBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function NetworksQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="networks_and_the_internet"
      topicLabel="Networks and the Internet"
      route="/cs/networks/question"
      fallbackQuestions={NETWORKS_QUESTIONS}
      fallbackGetNext={getNextNetworksQuestion}
      fallbackAdvance={advanceNetworksIndex}
    />
  );
}