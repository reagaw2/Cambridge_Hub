import { getNextOscillationsQuestion, advanceOscillationsIndex, OSCILLATIONS_QUESTIONS } from "@/lib/oscillationsBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function OscillationsQuestionAttempt() {
  return (
    <TopicalQuestionPage
      getNext={getNextOscillationsQuestion}
      advance={advanceOscillationsIndex}
      allQuestions={OSCILLATIONS_QUESTIONS}
      backRoute="/physics"
    />
  );
}