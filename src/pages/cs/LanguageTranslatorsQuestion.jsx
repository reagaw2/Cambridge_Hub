import { useState } from "react";
import { getNextLTQuestion, advanceLTIndex, LT_QUESTIONS } from "@/lib/csLTBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function LanguageTranslatorsQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextLTQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = LT_QUESTIONS[currentIdx % LT_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceLTIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % LT_QUESTIONS.length} total={LT_QUESTIONS.length} allQuestions={LT_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Language Translators" allQuestionsForDev={LT_QUESTIONS} />;
}