import { useState } from "react";
import { getNextDataRepQuestion, advanceDataRepIndex, DATA_REP_QUESTIONS } from "@/lib/csDataRepBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataRepresentationQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextDataRepQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceDataRepIndex(); }}
      allQuestions={DATA_REP_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}