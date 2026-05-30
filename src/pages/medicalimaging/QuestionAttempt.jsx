import { getNextMedicalImagingQuestion, advanceMedicalImagingIndex, MEDICAL_IMAGING_QUESTIONS } from "@/lib/medicalImagingBank";
import TopicalQuestionPage from "@/pages/physics/TopicalQuestionPage";

export default function MedicalImagingQuestionAttempt() {
  return <TopicalQuestionPage getNext={getNextMedicalImagingQuestion} advance={advanceMedicalImagingIndex} allQuestions={MEDICAL_IMAGING_QUESTIONS} />;
}