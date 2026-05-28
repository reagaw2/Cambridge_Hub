import { getNextOSQuestion, advanceOSIndex, OS_QUESTIONS } from "@/lib/csOSBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function OperatingSystemsQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="operating_systems"
      topicLabel="Operating Systems"
      route="/cs/operating-systems/question"
      fallbackQuestions={OS_QUESTIONS}
      fallbackGetNext={getNextOSQuestion}
      fallbackAdvance={advanceOSIndex}
    />
  );
}