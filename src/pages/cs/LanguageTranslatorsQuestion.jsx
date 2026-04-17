import { getNextLTQuestion, advanceLTIndex } from "@/lib/csLTBank";
import CSQuestionAttempt from "./CSQuestionAttempt";

export default function LanguageTranslatorsQuestion() {
  const { question, idx, total } = getNextLTQuestion();
  return <CSQuestionAttempt question={question} idx={idx} total={total} onAdvance={advanceLTIndex} />;
}