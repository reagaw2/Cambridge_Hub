import { useState } from "react";
import { getNextOSQuestion, advanceOSIndex, OS_QUESTIONS } from "@/lib/csOSBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function OperatingSystemsQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextOSQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceOSIndex(); }}
      allQuestions={OS_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}