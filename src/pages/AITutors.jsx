/**
 * AITutors — lists all AI tutors the student can chat with.
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Atom, Code2, BookOpen, ChevronRight } from "lucide-react";

const TUTORS = [
  {
    id: "physics_tutor",
    name: "Physics Tutor",
    description: "Cambridge 9702 expert — explains concepts, works through problems step-by-step, and highlights exam traps.",
    icon: Atom,
    color: "emerald",
    iconBg: "bg-emerald-500/20 border-emerald-500/30",
    iconColor: "text-emerald-400",
    cardBg: "from-emerald-900/30 to-transparent",
    cardBorder: "border-emerald-500/20 hover:border-emerald-500/40",
    glowColor: "hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]",
  },
  {
    id: "cs_problem_solver",
    name: "CS Problem Solver",
    description: "Cambridge 9618 Socratic tutor — guides you through problems with questions rather than direct answers.",
    icon: Code2,
    color: "blue",
    iconBg: "bg-blue-500/20 border-blue-500/30",
    iconColor: "text-blue-400",
    cardBg: "from-blue-900/30 to-transparent",
    cardBorder: "border-blue-500/20 hover:border-blue-500/40",
    glowColor: "hover:shadow-[0_0_24px_rgba(59,130,246,0.12)]",
  },
  {
    id: "study_planner",
    name: "Study Planner",
    description: "Analyses your weak topics and builds a personalised revision schedule to maximise your marks.",
    icon: BookOpen,
    color: "purple",
    iconBg: "bg-purple-500/20 border-purple-500/30",
    iconColor: "text-purple-400",
    cardBg: "from-purple-900/30 to-transparent",
    cardBorder: "border-purple-500/20 hover:border-purple-500/40",
    glowColor: "hover:shadow-[0_0_24px_rgba(168,85,247,0.12)]",
  },
];

export default function AITutors() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[600px] mx-auto px-4 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 pt-6 pb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">AI Tutors</h1>
            <p className="text-xs text-white/40 mt-0.5">Powered by Cambridge syllabus knowledge</p>
          </div>
        </div>

        {/* Tutor cards */}
        <div className="space-y-4">
          {TUTORS.map((tutor) => {
            const Icon = tutor.icon;
            return (
              <button
                key={tutor.id}
                onClick={() => navigate(`/ai-tutors/${tutor.id}`)}
                className={`group w-full text-left rounded-2xl border bg-gradient-to-r ${tutor.cardBg} ${tutor.cardBorder} ${tutor.glowColor} p-5 transition-all duration-300`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${tutor.iconBg}`}>
                      <Icon className={`w-6 h-6 ${tutor.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{tutor.name}</p>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed max-w-[260px]">{tutor.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-white/20 group-hover:${tutor.iconColor} group-hover:translate-x-0.5 transition-all shrink-0`} />
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-10">
          These tutors use AI — always verify key facts with official Cambridge resources.
        </p>
      </div>
    </div>
  );
}