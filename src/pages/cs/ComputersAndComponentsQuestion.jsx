import { useState } from "react";
import { getNextCompQuestion, advanceCompIndex, COMP_QUESTIONS } from "@/lib/csCompAndCompBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function ComputersAndComponentsQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextCompQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceCompIndex(); }}
      allQuestions={COMP_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}