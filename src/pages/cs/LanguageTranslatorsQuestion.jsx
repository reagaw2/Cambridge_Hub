import { getNextLTQuestion, advanceLTIndex, LT_QUESTIONS } from "@/lib/csLTBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function LanguageTranslatorsQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="language_translators"
      topicLabel="Language Translators"
      route="/cs/language-translators/question"
      fallbackQuestions={LT_QUESTIONS}
      fallbackGetNext={getNextLTQuestion}
      fallbackAdvance={advanceLTIndex}
    />
  );
}