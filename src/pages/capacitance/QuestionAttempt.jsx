import { getNextCapacitanceQuestion, advanceCapacitanceIndex, CAPACITANCE_QUESTIONS } from "@/lib/capacitanceBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function CapacitanceQuestionAttempt() {
  return (
    <TopicalQuestionPage
      getNext={getNextCapacitanceQuestion}
      advance={advanceCapacitanceIndex}
      allQuestions={CAPACITANCE_QUESTIONS}
      backRoute="/physics"
    />
  );
}