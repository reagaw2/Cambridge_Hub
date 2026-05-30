import { getNextKinematicsQuestion, advanceKinematicsIndex, KINEMATICS_QUESTIONS } from "@/lib/kinematicsBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function KinematicsQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextKinematicsQuestion} advance={advanceKinematicsIndex} allQuestions={KINEMATICS_QUESTIONS} />;
}