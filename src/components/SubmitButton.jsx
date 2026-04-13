export default function SubmitButton({ disabled, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? "Analysing..." : "Submit Answer"}
    </button>
  );
}