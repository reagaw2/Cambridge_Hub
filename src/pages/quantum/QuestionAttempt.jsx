import { getNextQuantumQuestion, advanceQuantumIndex, QUANTUM_QUESTIONS } from "@/lib/quantumBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function QuantumQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextQuantumQuestion} advance={advanceQuantumIndex} allQuestions={QUANTUM_QUESTIONS} />;
}