import { useState } from "react";
import { getNextNetworksQuestion, advanceNetworksIndex, NETWORKS_QUESTIONS } from "@/lib/csNetworksBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function NetworksQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextNetworksQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceNetworksIndex(); }}
      allQuestions={NETWORKS_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}