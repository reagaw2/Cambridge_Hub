import { getNextDataSecurityQuestion, advanceDataSecurityIndex, DATA_SECURITY_QUESTIONS } from "@/lib/csDataSecurityBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function DataSecurityQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="data_security"
      topicLabel="Data Security"
      route="/cs/data-security/question"
      fallbackQuestions={DATA_SECURITY_QUESTIONS}
      fallbackGetNext={getNextDataSecurityQuestion}
      fallbackAdvance={advanceDataSecurityIndex}
    />
  );
}