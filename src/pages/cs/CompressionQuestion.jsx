import { useState } from "react";
import { getNextCompressionQuestion, advanceCompressionIndex, COMPRESSION_QUESTIONS } from "@/lib/csCompressionBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function CompressionQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextCompressionQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = COMPRESSION_QUESTIONS[currentIdx % COMPRESSION_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceCompressionIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % COMPRESSION_QUESTIONS.length} total={COMPRESSION_QUESTIONS.length} allQuestions={COMPRESSION_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Compression" allQuestionsForDev={COMPRESSION_QUESTIONS} />;
}