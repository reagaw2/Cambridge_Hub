import { getNextForcesQuestion, advanceForcesIndex, FORCES_QUESTIONS } from "@/lib/forcesBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function ForcesQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextForcesQuestion} advance={advanceForcesIndex} allQuestions={FORCES_QUESTIONS} />;
}