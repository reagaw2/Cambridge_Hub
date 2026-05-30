import { getNextThermalQuestion, advanceThermalIndex, THERMAL_QUESTIONS } from "@/lib/thermalBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function ThermalQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextThermalQuestion} advance={advanceThermalIndex} allQuestions={THERMAL_QUESTIONS} />;
}