import { getNextGravitationalQuestion, advanceGravitationalIndex, GRAVITATIONAL_QUESTIONS } from "@/lib/gravitationalBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function GravitationalQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextGravitationalQuestion} advance={advanceGravitationalIndex} allQuestions={GRAVITATIONAL_QUESTIONS} />;
}