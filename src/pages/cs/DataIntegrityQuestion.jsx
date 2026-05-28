import { getNextDataIntegrityQuestion, advanceDataIntegrityIndex, DATA_INTEGRITY_QUESTIONS } from "@/lib/csDataIntegrityBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function DataIntegrityQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="data_integrity"
      topicLabel="Data Integrity"
      route="/cs/data-integrity/question"
      fallbackQuestions={DATA_INTEGRITY_QUESTIONS}
      fallbackGetNext={getNextDataIntegrityQuestion}
      fallbackAdvance={advanceDataIntegrityIndex}
    />
  );
}