import { useState } from "react";
import SubmittingOverlay from "./SubmittingOverlay";

export default function SubmitButton({ disabled, loading, onClick }) {
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = loading || localLoading;

  async function handleClick() {
    if (isLoading) return;
    setLocalLoading(true);
    try {
      await onClick();
    } finally {
      setLocalLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? "Marking…" : "Submit Answer"}
      </button>
      {isLoading && <SubmittingOverlay />}
    </>
  );
}