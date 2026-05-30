import { useState } from "react";
import { getNextNetworksQuestion, advanceNetworksIndex, NETWORKS_QUESTIONS } from "@/lib/csNetworksBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function NetworksQuestion() {
  const [currentIdx, setCurrentIdx] = useState(() => getNextNetworksQuestion().idx);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const question = NETWORKS_QUESTIONS[currentIdx % NETWORKS_QUESTIONS.length];
  function handleAdvance(_s, isCorrect) {
    setSessionAnswers(prev => ({ ...prev, [question.id]: isCorrect ? "correct" : "wrong" }));
    advanceNetworksIndex();
    setCurrentIdx(i => i + 1);
  }
  return <CSQuestionAttempt question={question} idx={currentIdx % NETWORKS_QUESTIONS.length} total={NETWORKS_QUESTIONS.length} allQuestions={NETWORKS_QUESTIONS} sessionAnswers={sessionAnswers} onAdvance={handleAdvance} onJumpTo={setCurrentIdx} topicLabel="Networks and the Internet" allQuestionsForDev={NETWORKS_QUESTIONS} />;
}