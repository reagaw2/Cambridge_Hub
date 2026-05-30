import { useState } from "react";
import { getNextDataRepQuestion, advanceDataRepIndex, DATA_REP_QUESTIONS } from "@/lib/csDataRepBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataRepresentationQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextDataRepQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});

  const question = DATA_REP_QUESTIONS[currentIdx % DATA_REP_QUESTIONS.length];

  function handleAdvance(_status, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceDataRepIndex();
    setCurrentIdx(i => i + 1);
  }

  return (
    <CSQuestionAttempt
      question={question}
      idx={currentIdx % DATA_REP_QUESTIONS.length}
      total={DATA_REP_QUESTIONS.length}
      allQuestions={DATA_REP_QUESTIONS}
      sessionAnswers={sessionAnswers}
      onAdvance={handleAdvance}
      onJumpTo={(i) => setCurrentIdx(i)}
      topicLabel="Data Representation"
      allQuestionsForDev={DATA_REP_QUESTIONS}
    />
  );
}