import { useState } from "react";
import { getNextDataIntegrityQuestion, advanceDataIntegrityIndex, DATA_INTEGRITY_QUESTIONS } from "@/lib/csDataIntegrityBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataIntegrityQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextDataIntegrityQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceDataIntegrityIndex(); }}
      allQuestions={DATA_INTEGRITY_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}