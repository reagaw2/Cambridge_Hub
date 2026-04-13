import { useState } from "react";
import TopBar from "../components/TopBar";
import QuestionCard from "../components/QuestionCard";
import AnswerInput from "../components/AnswerInput";
import SubmitButton from "../components/SubmitButton";
import StreakIndicator from "../components/StreakIndicator";

export default function QuestionAttempt() {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    // Submit logic
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <TopBar />

        <div className="flex-1 flex flex-col gap-4 p-4">
          <QuestionCard />
          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0} onClick={handleSubmit} />
          <StreakIndicator />
        </div>
      </div>
    </div>
  );
}