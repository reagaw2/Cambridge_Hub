import { getNextPhysicalQuantitiesQuestion, advancePhysicalQuantitiesIndex, PHYSICAL_QUANTITIES_QUESTIONS } from "@/lib/physicalQuantitiesBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function PhysicalQuantitiesQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextPhysicalQuantitiesQuestion} advance={advancePhysicalQuantitiesIndex} allQuestions={PHYSICAL_QUANTITIES_QUESTIONS} />;
}