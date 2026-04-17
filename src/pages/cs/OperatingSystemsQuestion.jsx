import { getNextOSQuestion, advanceOSIndex } from "@/lib/csOSBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function OperatingSystemsQuestion() {
  const { question, idx, total } = getNextOSQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceOSIndex} />;
}