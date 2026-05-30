import { useState } from "react";
import { getNextCompQuestion, advanceCompIndex, COMP_QUESTIONS } from "@/lib/csCompAndCompBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function ComputersAndComponentsQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextCompQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = COMP_QUESTIONS[currentIdx % COMP_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceCompIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % COMP_QUESTIONS.length} total={COMP_QUESTIONS.length} allQuestions={COMP_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Computers and Components" allQuestionsForDev={COMP_QUESTIONS} />;
}