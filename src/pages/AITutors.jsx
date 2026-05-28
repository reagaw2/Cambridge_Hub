import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, BrainCircuit } from "lucide-react";

export default function AITutors() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[140px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <h1 className="text-xl font-extrabold text-white">AI Tutors</h1>
      </div>

      {/* Coming soon content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-white/30" />
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-bold text-white/80">Coming Soon</p>
          <p className="text-sm text-white/35 leading-relaxed max-w-[260px]">
            AI Tutors are being upgraded and will be back shortly.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-3 rounded-xl bg-white/8 border border-white/10 text-sm font-semibold text-white/60 hover:bg-white/12 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}