import { useState } from "react";
import { getNextDataSecurityQuestion, advanceDataSecurityIndex, DATA_SECURITY_QUESTIONS } from "@/lib/csDataSecurityBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataSecurityQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextDataSecurityQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = DATA_SECURITY_QUESTIONS[currentIdx % DATA_SECURITY_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceDataSecurityIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % DATA_SECURITY_QUESTIONS.length} total={DATA_SECURITY_QUESTIONS.length} allQuestions={DATA_SECURITY_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Data Security" allQuestionsForDev={DATA_SECURITY_QUESTIONS} />;
}