import { getNextEMInductionQuestion, advanceEMInductionIndex, EM_INDUCTION_QUESTIONS } from "@/lib/emInductionBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function EMInductionQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextEMInductionQuestion} advance={advanceEMInductionIndex} allQuestions={EM_INDUCTION_QUESTIONS} />;
}