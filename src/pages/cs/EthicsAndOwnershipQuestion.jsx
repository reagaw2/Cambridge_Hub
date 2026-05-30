import { useState } from "react";
import { getNextEthicsQuestion, advanceEthicsIndex, ETHICS_QUESTIONS } from "@/lib/csEthicsBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function EthicsAndOwnershipQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextEthicsQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = ETHICS_QUESTIONS[currentIdx % ETHICS_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceEthicsIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % ETHICS_QUESTIONS.length} total={ETHICS_QUESTIONS.length} allQuestions={ETHICS_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Ethics and Ownership" allQuestionsForDev={ETHICS_QUESTIONS} />;
}