import { getNextElectricQuestion, advanceElectricIndex, ELECTRIC_QUESTIONS } from "@/lib/electricBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function ElectricQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextElectricQuestion} advance={advanceElectricIndex} allQuestions={ELECTRIC_QUESTIONS} />;
}