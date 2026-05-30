import { getNextAstrophysicsQuestion, advanceAstrophysicsIndex, ASTROPHYSICS_QUESTIONS } from "@/lib/astrophysicsBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function AstroQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextAstrophysicsQuestion} advance={advanceAstrophysicsIndex} allQuestions={ASTROPHYSICS_QUESTIONS} />;
}