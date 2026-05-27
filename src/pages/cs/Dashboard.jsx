import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { csGetTopicData, csGetReviewBank, csGetGuessReviewBank } from "@/lib/csTopicStore";
import { ArrowUp, ArrowRight, ArrowDown, Flame, ChevronRight, Bookmark, RefreshCw, ArrowLeft, Lock, Code2, Sparkles } from "lucide-react";
import { toast } from "sonner";

function getLockStatus(locked_until) {
  if (!locked_until) return { locked: false, msRemaining: 0 };
  const ms = new Date(locked_until).getTime() - Date.now();
  return { locked: ms > 0, msRemaining: Math.max(0, ms) };
}

function formatCountdown(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function TrendBadge({ trend }) {
  if (trend === "improving") return (
    <span className="flex items-center gap-1 text-xs font-medium text-blue-400">
      <ArrowUp className="w-3 h-3" /> Improving
    </span>);
  if (trend === "steady") return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
      <ArrowRight className="w-3 h-3" /> Steady
    </span>);
  if (trend === "needs_work") return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-400">
      <ArrowDown className="w-3 h-3" /> Needs work
    </span>);
  return null;
}

function trendToScore(trend) {
  if (trend === "improving") return 85;
  if (trend === "steady") return 60;
  return 30;
}

function OverallConfidence({ topicData }) {
  const allData = Object.values(topicData).filter(Boolean);
  if (allData.length === 0) return <span className="text-xs text-white/30">No data yet</span>;
  const avg = Math.round(allData.reduce((sum, d) => sum + trendToScore(d.trend), 0) / allData.length);
  const color = avg >= 70 ? "text-blue-400" : avg >= 50 ? "text-amber-400" : "text-red-400";
  return <span className={`text-sm font-bold ${color}`}>{avg}%</span>;
}

function reviewBankSubtitle(bank) {
  const unlocked = bank.filter(q => !getLockStatus(q.locked_until).locked);
  const locked = bank.filter(q => getLockStatus(q.locked_until).locked);
  if (unlocked.length === 0) {
    const soonest = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until))[0];
    return `All waiting · Next unlocks in ${formatCountdown(getLockStatus(soonest?.locked_until).msRemaining)}`;
  }
  if (locked.length === 0) return `${unlocked.length} question${unlocked.length !== 1 ? "s" : ""} ready to attempt`;
  return `${unlocked.length} ready · ${locked.length} waiting`;
}

function guessBankSubtitle(bank) {
  const unlocked = bank.filter(e => !getLockStatus(e.locked_until).locked);
  const locked = bank.filter(e => getLockStatus(e.locked_until).locked);
  if (unlocked.length === 0 && locked.length > 0) {
    const soonest = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until))[0];
    return `All waiting · Next unlocks in ${formatCountdown(getLockStatus(soonest?.locked_until).msRemaining)}`;
  }
  if (locked.length === 0) return `${unlocked.length} question${unlocked.length !== 1 ? "s" : ""} ready`;
  return `${unlocked.length} ready · ${locked.length} waiting`;
}

const PTR_THRESHOLD = 72;

function usePullToRefresh(onRefresh) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (el && el.scrollTop === 0) startY.current = e.touches[0].clientY;
  }, []);
  const onTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.5, PTR_THRESHOLD + 20));
  }, []);
  const onTouchEnd = useCallback(async () => {
    if (pullY >= PTR_THRESHOLD) {
      setRefreshing(true);
      setPullY(PTR_THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  }, [pullY, onRefresh]);

  return { containerRef, pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}

const CHAPTERS = [
  {
    chapter: "Chapter 1 — Information Representation",
    topics: [
      { label: "Data Representation", key: "data_representation", active: true, route: "/cs/data-representation/question" },
      { label: "Multimedia", key: "multimedia", active: false },
      { label: "Compression", key: "compression", active: true, route: "/cs/compression/question" },
    ],
  },
  {
    chapter: "Chapter 2 — Communication",
    topics: [
      { label: "Networks and the Internet", key: "networks_and_internet", active: true, route: "/cs/networks/question" },
    ],
  },
  {
    chapter: "Chapter 3 — Hardware",
    topics: [
      { label: "Computers and Components", key: "computers_and_components", active: true, route: "/cs/computers-and-components/question" },
    ],
  },
  {
    chapter: "Chapter 4 — Processor Fundamentals",
    topics: [
      { label: "CPU Architecture", key: "cpu_architecture", active: false },
    ],
  },
  {
    chapter: "Chapter 5 — System Software",
    topics: [
      { label: "Operating Systems", key: "operating_systems", active: true, route: "/cs/operating-systems/question" },
      { label: "Language Translators", key: "language_translators", active: true, route: "/cs/language-translators/question" },
    ],
  },
  {
    chapter: "Chapter 6 — Security, Privacy and Data Integrity",
    topics: [
      { label: "Data Security", key: "data_security", active: true, route: "/cs/data-security/question" },
      { label: "Data Integrity", key: "data_integrity", active: true, route: "/cs/data-integrity/question" },
    ],
  },
  {
    chapter: "Chapter 7 — Ethics and Ownership",
    topics: [
      { label: "Ethics and Ownership", key: "ethics_and_ownership", active: true, route: "/cs/ethics-and-ownership/question" },
    ],
  },
  {
    chapter: "Chapter 8 — Databases",
    topics: [
      { label: "Database Concepts", key: "database_concepts", active: false },
      { label: "Database Management Systems", key: "database_management_systems", active: false },
    ],
  },
  {
    chapter: "Chapter 9 — Algorithm Design and Problem-Solving",
    topics: [
      { label: "Computational Thinking Skills", key: "computational_thinking_skills", active: false },
    ],
  },
  {
    chapter: "Chapter 10 — Data Types and Structures",
    topics: [
      { label: "Data Types and Records", key: "data_types_and_records", active: false },
      { label: "Abstract Data Types", key: "abstract_data_types", active: false },
    ],
  },
  {
    chapter: "Chapter 12 — Software Development",
    topics: [
      { label: "Program Development Life Cycle", key: "program_development_life_cycle", active: false },
      { label: "Program Design", key: "program_design", active: false },
      { label: "Program Testing and Maintenance", key: "program_testing_and_maintenance", active: false },
    ],
  },
  {
    chapter: "Chapter 13 — Data Representation (A Level)",
    topics: [
      { label: "User-defined Data Types", key: "user_defined_data_types", active: false },
      { label: "File Organisation and Access", key: "file_organisation_and_access", active: false },
    ],
  },
  {
    chapter: "Chapter 14 — Communication and Internet Technologies (A Level)",
    topics: [
      { label: "Protocols", key: "protocols", active: false },
      { label: "Circuit and Packet Switching", key: "circuit_and_packet_switching", active: false },
    ],
  },
  {
    chapter: "Chapter 15 — Hardware and Virtual Machines (A Level)",
    topics: [
      { label: "Processors and Parallel Processing", key: "processors_and_parallel_processing", active: false },
    ],
  },
  {
    chapter: "Chapter 16 — System Software (A Level)",
    topics: [
      { label: "OS Purposes", key: "os_purposes", active: false },
      { label: "Translation Software", key: "translation_software", active: false },
    ],
  },
  {
    chapter: "Chapter 17 — Security (A Level)",
    topics: [
      { label: "Encryption and Digital Certificates", key: "encryption_and_digital_certificates", active: false },
    ],
  },
  {
    chapter: "Chapter 18 — Artificial Intelligence (A Level)",
    topics: [
      { label: "Artificial Intelligence", key: "artificial_intelligence", active: false },
    ],
  },
  {
    chapter: "Chapter 20 — Further Programming (A Level)",
    topics: [
      { label: "Programming Paradigms", key: "programming_paradigms", active: false },
    ],
  },
];

const ACTIVE_KEYS = CHAPTERS.flatMap(c => c.topics.filter(t => t.active).map(t => t.key));

export default function CSDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoadingProgress } = useAuth();
  const { avatarLetter } = useDisplayName();
  const [topicData, setTopicData] = useState({});
  const [reviewBank, setReviewBank] = useState([]);
  const [guessReviewBank, setGuessReviewBank] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    setLoading(true);
    const topicResults = await Promise.all(ACTIVE_KEYS.map(k => csGetTopicData(k)));
    const [rb, grb] = await Promise.all([csGetReviewBank(), csGetGuessReviewBank()]);
    setReviewBank(rb);
    setGuessReviewBank(grb);
    const dataMap = {};
    ACTIVE_KEYS.forEach((k, i) => { dataMap[k] = topicResults[i]; });
    setTopicData(dataMap);
    setLoading(false);
  }

  useEffect(() => {
    if (!isLoadingProgress) loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingProgress]);

  const handleRefresh = useCallback(async () => {
    await new Promise(r => setTimeout(r, 300));
    await loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const { containerRef, pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(handleRefresh);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-[540px] mx-auto flex flex-col overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: pullY > 0 ? "none" : "auto" }}
      >
        {/* Pull-to-refresh */}
        <div className="flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{ height: pullY > 0 || refreshing ? `${pullY}px` : 0 }}>
          <RefreshCw className={`w-5 h-5 text-blue-400 transition-transform ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: !refreshing ? `rotate(${(pullY / PTR_THRESHOLD) * 360}deg)` : undefined }} />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Computer Science</span>
            <span className="text-[10px] text-white/30">9618</span>
          </div>
          <button onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-400">{avatarLetter}</span>
          </button>
        </div>

        {/* Overall confidence */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Overall confidence</span>
          {!loading && <OverallConfidence topicData={topicData} />}
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6 pb-8">

          {/* Today's Focus — Coming Soon */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex items-center gap-4 opacity-60 cursor-not-allowed select-none">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-blue-400/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-0.5">Today's Focus</p>
              <p className="text-sm text-white/30">AI-powered recommendations</p>
            </div>
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-blue-400/60 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>

          {/* Review Banks */}
          {reviewBank.length > 0 && (
            <div onClick={() => navigate("/cs/review-bank")}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/10 transition-all">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{reviewBank.length} question{reviewBank.length !== 1 ? "s" : ""} in review bank</p>
                  <p className="text-[11px] text-white/40 mt-0.5 truncate">{reviewBankSubtitle(reviewBank)}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
          )}

          {guessReviewBank.length > 0 && (
            <div onClick={() => navigate("/cs/guess-review-bank")}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/10 transition-all">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-base shrink-0">🎲</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{guessReviewBank.length} MCQ flagged as guesses</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{guessBankSubtitle(guessReviewBank)}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
          )}

          {/* Chapters */}
          {CHAPTERS.map(({ chapter, topics }) => (
            <div key={chapter} className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 pt-1">{chapter}</p>
              {topics.map(({ label, key, active, route }) => {
                const data = topicData[key];
                if (!active) {
                  return (
                    <div key={key}
                      onClick={() => toast("This topic is coming soon.", { duration: 2000, position: "bottom-center", style: { background: "#1e1b4b", color: "#c7d2fe", border: "none" } })}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-40 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white/50 text-sm">{label}</p>
                        <Lock className="w-3.5 h-3.5 text-white/20 shrink-0" />
                      </div>
                      <p className="text-[11px] text-blue-400/40 mt-1">Coming soon</p>
                    </div>
                  );
                }
                return (
                  <div key={key} onClick={() => navigate(route)}
                    className="rounded-xl border border-white/8 bg-white/[0.03] hover:bg-blue-500/5 hover:border-blue-500/25 p-4 cursor-pointer transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 flex-1">
                        <p className="font-semibold text-white text-sm">{label}</p>
                        {data ? (
                          <>
                            <TrendBadge trend={data.trend} />
                            <div className="flex items-center gap-4">
                              {data.lastLabel && <span className="text-[11px] text-white/30">Last: {data.lastLabel}</span>}
                              {data.streak > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-white/30">
                                  <Flame className="w-3 h-3 text-orange-400/70" /> {data.streak}d streak
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-blue-400/60 font-medium">Ready to start</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="pb-4" />
        </div>
      </div>
    </div>
  );
}