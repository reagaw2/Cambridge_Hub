import { getNextCircularMotionQuestion, advanceCircularMotionIndex, CIRCULAR_MOTION_QUESTIONS } from "@/lib/circularMotionBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function CircularMotionQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextCircularMotionQuestion} advance={advanceCircularMotionIndex} allQuestions={CIRCULAR_MOTION_QUESTIONS} />;
}