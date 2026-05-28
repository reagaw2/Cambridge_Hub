import { getNextDataRepQuestion, advanceDataRepIndex, DATA_REP_QUESTIONS } from "@/lib/csDataRepBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function DataRepresentationQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="data_representation"
      topicLabel="Data Representation"
      route="/cs/data-representation/question"
      fallbackQuestions={DATA_REP_QUESTIONS}
      fallbackGetNext={getNextDataRepQuestion}
      fallbackAdvance={advanceDataRepIndex}
    />
  );
}