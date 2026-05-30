import { WAVES_QUESTIONS } from "@/lib/wavesBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

let _wIdx = 0;
function getNext() { return { question: WAVES_QUESTIONS[_wIdx % WAVES_QUESTIONS.length], idx: _wIdx % WAVES_QUESTIONS.length, total: WAVES_QUESTIONS.length }; }
function advance() { _wIdx = (_wIdx + 1) % WAVES_QUESTIONS.length; }

export default function WavesQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNext} advance={advance} allQuestions={WAVES_QUESTIONS} />;
}