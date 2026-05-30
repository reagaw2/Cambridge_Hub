import { getNextNuclearQuestion, advanceNuclearIndex, NUCLEAR_QUESTIONS } from "@/lib/nuclearBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function NuclearQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextNuclearQuestion} advance={advanceNuclearIndex} allQuestions={NUCLEAR_QUESTIONS} />;
}