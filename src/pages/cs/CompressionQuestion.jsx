import { getNextCompressionQuestion, advanceCompressionIndex, COMPRESSION_QUESTIONS } from "@/lib/csCompressionBank";
import SupabaseCSQuestion from "./SupabaseCSQuestion";

export default function CompressionQuestion() {
  return (
    <SupabaseCSQuestion
      topicKey="compression"
      topicLabel="Compression"
      route="/cs/compression/question"
      fallbackQuestions={COMPRESSION_QUESTIONS}
      fallbackGetNext={getNextCompressionQuestion}
      fallbackAdvance={advanceCompressionIndex}
    />
  );
}