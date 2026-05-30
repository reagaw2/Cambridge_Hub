import { useState } from "react";
import { getNextDataIntegrityQuestion, advanceDataIntegrityIndex, DATA_INTEGRITY_QUESTIONS } from "@/lib/csDataIntegrityBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataIntegrityQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextDataIntegrityQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = DATA_INTEGRITY_QUESTIONS[currentIdx % DATA_INTEGRITY_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceDataIntegrityIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % DATA_INTEGRITY_QUESTIONS.length} total={DATA_INTEGRITY_QUESTIONS.length} allQuestions={DATA_INTEGRITY_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Data Integrity" allQuestionsForDev={DATA_INTEGRITY_QUESTIONS} />;
}