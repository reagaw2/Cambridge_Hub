import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { getTopicData, getMCQOnlyTopicNames, getStreakData, recordAppOpen, shouldShowReviewGate, getReviewBank, getGuessReviewBank } from "@/lib/topicStore";
import { csGetTopicData } from "@/lib/csTopicStore";
import { Atom, Code2, FileText, BookOpen, GraduationCap, Star, ArrowRight, Lock, Users } from "lucide-react";
import GlobalStreakBadge from "@/components/GlobalStreakBadge";
import ReviewGate from "@/components/ReviewGate";
import ExamCountdown from "@/components/ExamCountdown";

const WRITTEN_KEYS = [
  "gravitational_fields", "nuclear_physics", "thermal_physics", "oscillations",
  "electric_fields", "capacitance", "electromagnetic_induction", "quantum_physics", "astrophysics",
];

const CS_ACTIVE_KEYS = [
  "data_representation", "compression", "computers_and_components",
  "operating_systems", "language_translators", "ethics_and_ownership",
  "networks_and_the_internet", "data_security", "data_integrity",
];

const trendToScore = (trend) => {
  if (trend === "improving") return 85;
  if (trend === "steady") return 60;
  return 30;
};

function getGreeting(name) {
  const h = new Date().getHours();
  const n = name || "there";
  if (h < 12) return `Good morning, ${n}`;
  if (h < 17) return `Good afternoon, ${n}`;
  return `Good evening, ${n}`;
}

function ScorePill({ score }) {
  if (score === null) return <span className="text-xs text-white/30">Not started</span>;
  const color = score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  return <span className={`text-sm font-bold tabular-nums ${color}`}>{score}%</span>;
}

function LockedModeCard({ icon: Icon, iconBg, iconColor, title, description, badge }) {
  return (
    <div className="relative w-full text-left rounded-2xl border border-white/5 bg-white/[0.02] p-5 overflow-hidden opacity-60 cursor-not-allowed select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-white/50 text-sm">{title}</p>
              {badge && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">{badge}</span>
              )}
            </div>
            <p className="text-[11px] text-white/25">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/8 border border-white/10 px-2.5 py-1 rounded-full">
            Coming Soon
          </span>
          <Lock className="w-3.5 h-3.5 text-white/30" />
        </div>
      </div>
    </div>
  );
}

export default function SubjectSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { displayName, avatarLetter } = useDisplayName();
  const [physicsScore, setPhysicsScore] = useState(null);
  const [physicsLoaded, setPhysicsLoaded] = useState(false);
  const [csScore, setCsScore] = useState(null);
  const [csLoaded, setCsLoaded] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [gateWrittenCount, setGateWrittenCount] = useState(0);
  const [gateMcqCount, setGateMcqCount] = useState(0);

  useEffect(() => {
    async function calcPhysicsScore() {
      const mcqTopics = await getMCQOnlyTopicNames(WRITTEN_KEYS);
      const allKeys = [...WRITTEN_KEYS, ...mcqTopics.map(t => t.key)];
      const results = await Promise.all(allKeys.map(k => getTopicData(k)));
      const attempted = results.filter(Boolean);
      if (attempted.length === 0) { setPhysicsLoaded(true); return; }
      const avg = Math.round(attempted.reduce((sum, d) => sum + trendToScore(d.trend), 0) / attempted.length);
      setPhysicsScore(avg);
      setPhysicsLoaded(true);
    }
    async function calcCSScore() {
      const results = await Promise.all(CS_ACTIVE_KEYS.map(k => csGetTopicData(k)));
      const attempted = results.filter(Boolean);
      if (attempted.length === 0) { setCsLoaded(true); return; }
      const avg = Math.round(attempted.reduce((sum, d) => sum + trendToScore(d.trend), 0) / attempted.length);
      setCsScore(avg);
      setCsLoaded(true);
    }
    async function loadData() {
      const [sd, gateCheck, writtenBank, mcqBank] = await Promise.all([
        getStreakData(),
        shouldShowReviewGate(),
        getReviewBank(),
        getGuessReviewBank(),
      ]);
      setStreakData(sd);
      if (gateCheck) {
        setGateWrittenCount(writtenBank.length);
        setGateMcqCount(mcqBank.length);
        setShowGate(true);
      }
      await recordAppOpen();
    }
    calcPhysicsScore();
    calcCSScore();
    loadData();
  }, [user?.email, location.key]);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white overflow-x-hidden">

      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      {showGate && (
        <ReviewGate
          writtenCount={gateWrittenCount}
          mcqCount={gateMcqCount}
          onComplete={() => setShowGate(false)}
        />
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Cambridge Hub</p>
            <p className="text-[10px] text-white/40 leading-none mt-0.5">A Level Revision</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {streakData && (streakData.global_streak > 0 || (streakData.daily_question_count?.count ?? 0) > 0) && (
            <GlobalStreakBadge streakData={streakData} />
          )}
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 flex items-center justify-center text-xs font-bold text-white hover:brightness-125 transition-all"
          >
            {avatarLetter}
          </button>
        </div>
      </div>

      {/* Study Buddy banner */}
      <div className="relative z-10 flex justify-center px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 select-none cursor-not-allowed">
          <Users className="w-3.5 h-3.5 text-pink-400/70 shrink-0" />
          <span className="text-[12px] font-semibold text-pink-300/70">Find a Study Buddy</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-pink-400/60 bg-pink-500/15 border border-pink-500/20 px-2 py-0.5 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16">

        {/* Hero */}
        <div className="pt-8 pb-10 text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">{getGreeting(displayName)} 👋</span>
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto">
            What are you studying today? Pick a subject to begin your session.
          </p>
        </div>

        {/* Exam Countdown — shown above subject cards */}
        <div className="mb-8">
          <ExamCountdown />
        </div>

        {/* Subject cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <button
            onClick={() => navigate("/physics")}
            className="group relative text-left rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 hover:from-emerald-800/50 hover:to-emerald-900/70 p-6 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Atom className="w-5 h-5 text-emerald-400" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-lg font-bold text-white mb-0.5">Physics</p>
              <p className="text-xs text-white/40 mb-4">9702 · A Level</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">Confidence</span>
                {physicsLoaded ? <ScorePill score={physicsScore} /> : <span className="text-xs text-white/20">Loading…</span>}
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/cs")}
            className="group relative text-left rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 to-blue-950/60 hover:from-blue-800/50 hover:to-blue-900/70 p-6 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-lg font-bold text-white mb-0.5">Computer Science</p>
              <p className="text-xs text-white/40 mb-4">9618 · A Level</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">Confidence</span>
                {csLoaded ? <ScorePill score={csScore} /> : <span className="text-xs text-white/20">Loading…</span>}
              </div>
            </div>
          </button>

        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          <LockedModeCard
            icon={FileText}
            iconBg="bg-purple-500/15"
            iconColor="text-purple-400"
            title="Past Paper Mode"
            description="Full timed paper under exam conditions"
          />
          <LockedModeCard
            icon={BookOpen}
            iconBg="bg-amber-500/15"
            iconColor="text-amber-400"
            title="Timed Mock Exam"
            description="Full paper with self-marking at the end"
          />
          <LockedModeCard
            icon={GraduationCap}
            iconBg="bg-emerald-500/20"
            iconColor="text-emerald-400"
            title="Interactive Mock Exams"
            description="Sub-part by sub-part with instant AI feedback"
            badge="AI"
          />
        </div>

        <p className="text-center text-[11px] text-white/20 mt-8">
          More subjects coming soon — Mathematics, Chemistry, Biology
        </p>

      </div>
    </div>
  );
}