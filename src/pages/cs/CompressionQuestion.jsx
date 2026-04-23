import { useState } from "react";
import { getNextCompressionQuestion, advanceCompressionIndex, COMPRESSION_QUESTIONS } from "@/lib/csCompressionBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function CompressionQuestion() {
  const [override, setOverride] = useState(null);
  const { question: queued, idx: qIdx, total } = getNextCompressionQuestion();
  const question = override ?? queued;
  const idx = override ? 0 : qIdx;
  return (
    <CSQuestionAttempt
      question={question} idx={idx} total={override ? 1 : total}
      onAdvance={() => { setOverride(null); advanceCompressionIndex(); }}
      allQuestions={COMPRESSION_QUESTIONS}
      onOverride={(q) => { setOverride(q); }}
    />
  );
}