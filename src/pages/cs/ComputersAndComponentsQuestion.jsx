import { getNextCompQuestion, advanceCompIndex, COMP_QUESTIONS } from "@/lib/csCompAndCompBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function ComputersAndComponentsQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="computers_and_components"
      topicLabel="Computers and Components"
      route="/cs/computers-and-components/question"
      fallbackQuestions={COMP_QUESTIONS}
      fallbackGetNext={getNextCompQuestion}
      fallbackAdvance={advanceCompIndex}
    />
  );
}