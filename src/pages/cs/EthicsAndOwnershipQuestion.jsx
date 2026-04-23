import { useState } from "react";
import { getNextEthicsQuestion, advanceEthicsIndex, ETHICS_QUESTIONS } from "@/lib/csEthicsBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function EthicsAndOwnershipQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextEthicsQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceEthicsIndex(); }}
      allQuestions={ETHICS_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}