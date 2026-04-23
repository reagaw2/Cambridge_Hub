import { useState } from "react";
import { getNextDataSecurityQuestion, advanceDataSecurityIndex, DATA_SECURITY_QUESTIONS } from "@/lib/csDataSecurityBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function DataSecurityQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextDataSecurityQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceDataSecurityIndex(); }}
      allQuestions={DATA_SECURITY_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}