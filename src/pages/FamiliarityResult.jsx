import { useLocation, useNavigate } from "react-router-dom";

export default function FamiliarityResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const response = state?.claudeResponse ?? "No response received.";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[480px] flex flex-col gap-8">
        <div className="border-l-4 border-primary pl-5">
          <p className="text-[15px] text-foreground/90 leading-relaxed">{response}</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Continue practising
        </button>
      </div>
    </div>
  );
}