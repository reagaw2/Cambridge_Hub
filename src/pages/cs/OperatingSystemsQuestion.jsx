import { useState } from "react";
import { getNextOSQuestion, advanceOSIndex, OS_QUESTIONS } from "@/lib/csOSBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function OperatingSystemsQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextOSQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = OS_QUESTIONS[currentIdx % OS_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceOSIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % OS_QUESTIONS.length} total={OS_QUESTIONS.length} allQuestions={OS_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Operating Systems" allQuestionsForDev={OS_QUESTIONS} />;
}