import { useState } from "react";
import { getNextLTQuestion, advanceLTIndex, LT_QUESTIONS } from "@/lib/csLTBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function LanguageTranslatorsQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextLTQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceLTIndex(); }}
      allQuestions={LT_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}