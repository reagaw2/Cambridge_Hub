import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { getTopicData, resetData, getReviewBank, getGuessReviewBank, getMCQOnlyTopicNames } from "../lib/topicStore";
import { ArrowUp, ArrowRight, ArrowDown, Flame, ChevronRight, Bookmark, RefreshCw, ArrowLeft, Lock, Atom, Sparkles, FileText, AlertTriangle } from "lucide-react";
import GlobalStreakBadge from "@/components/GlobalStreakBadge";
import { getStreakData } from "@/lib/topicStore";
import { P1_PAPERS } from "@/lib/physicsP1Bank";
import P1ModeModal from "@/components/P1ModeModal";

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

function reviewBankSubtitle(bank) {
  const unlocked = bank.filter(q => !getLockStatus(q.locked_until).locked);
  const locked = bank.filter(q => getLockStatus(q.locked_until).locked);
  if (unlocked.length === 0) {
    const soonest = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until))[0];
    return `All waiting · Next unlocks in ${formatCountdown(getLockStatus(soonest?.locked_until).msRemaining)}`;
  }
  if (locked.length === 0) return `${unlocked.length} question${unlocked.length !== 1 ? "s" : ""} ready to attempt`;
  return `${unlocked.length} ready to attempt · ${locked.length} waiting`;
}

function guessBankSubtitle(bank) {
  const normalised = bank.map(e => typeof e === "string" ? { question_id: e, locked_until: null } : e);
  const unlocked = normalised.filter(e => !getLockStatus(e.locked_until).locked);
  const locked = normalised.filter(e => getLockStatus(e.locked_until).locked);
  if (unlocked.length === 0 && locked.length > 0) {
    const soonest = [...locked].sort((a, b) => new Date(a.locked_until) - new Date(b.locked_until))[0];
    return `All waiting · Next unlocks in ${formatCountdown(getLockStatus(soonest?.locked_until).msRemaining)}`;
  }
  if (locked.length === 0) return `${unlocked.length} question${unlocked.length !== 1 ? "s" : ""} ready`;
  return `${unlocked.length} ready · ${locked.length} waiting`;
}

const MCQ_ONLY_TOPICS = [
  "Physical Quantities & Units",
  "Dynamics & Newton's Laws",
  "Momentum & Collisions",
  "Forces, Torques & Equilibrium",
  "Work, Energy & Power",
  "Deformation of Solids",
  "Electricity",
  "Nuclear Physics & Particle Physics",
];

const COMING_SOON = [
  "Medical Physics",
  "Ideal Gases", "Superposition", "Mechanics",
];

function trendToScore(trend) {
  if (trend === "improving") return 85;
  if (trend === "steady") return 60;
  return 30;
}

const WRITTEN_KEYS_FOR_CONFIDENCE = [
  "physical_quantities_units", "kinematics", "forces_equilibrium", "waves",
  "circular_motion", "gravitational_fields", "thermal_physics", "oscillations",
  "electric_fields", "capacitance", "magnetic_fields", "electromagnetic_induction",
  "alternating_currents", "quantum_physics", "nuclear_physics", "medical_imaging", "astrophysics",
];

function OverallConfidence({ topicData, mcqOnlyTopics }) {
  const allData = [
    ...WRITTEN_KEYS_FOR_CONFIDENCE.map(k => topicData[k]),
    ...mcqOnlyTopics.map(t => topicData[t.key]),
  ].filter(Boolean);
  if (allData.length === 0) return <span className="text-xs text-white/30">No data yet</span>;
  const avg = Math.round(allData.reduce((sum, d) => sum + trendToScore(d.trend), 0) / allData.length);
  const color = avg >= 70 ? "text-emerald-400" : avg >= 50 ? "text-amber-400" : "text-red-400";
  return <span className={`text-sm font-bold ${color}`}>{avg}%</span>;
}

function TrendBadge({ trend }) {
  if (trend === "improving") return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
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

function SectionDivider({ label, sublabel }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-white/8" />
      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-widest text-white/40">{label}</p>
        {sublabel && <p className="text-[9px] text-white/20 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

const PTR_THRESHOLD = 72;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoadingProgress } = useAuth();
  const [topicData, setTopicData] = useState({});
  const [mcqOnlyTopics, setMcqOnlyTopics] = useState([]);
  const [reviewBank, setReviewBank] = useState([]);
  const [guessReviewBank, setGuessReviewBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState(null);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const { avatarLetter } = useDisplayName();

  // P1 paper mode modal
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Interrupted exam detection
  const [interruptedExam, setInterruptedExam] = useState(null);

  useEffect(() => {
    // Check for interrupted P1 exam sessions
    for (const paper of P1_PAPERS) {
      try {
        const saved = JSON.parse(localStorage.getItem(`p1_exam_${paper.id}`) ?? 'null');
        if (saved?.interrupted && saved?.paperId === paper.id) {
          setInterruptedExam({ paper, answers: saved.answers ?? {} });
          break;
        }
      } catch {}
    }
  }, []);

  function handleViewInterruptedResults() {
    if (!interruptedExam) return;
    const { paper, answers } = interruptedExam;
    localStorage.removeItem(`p1_exam_${paper.id}`);
    setInterruptedExam(null);
    navigate("/physics/p1-summary", {
      state: { answers, questions: paper.questions, paperId: paper.id, examMode: true }
    });
  }

  function handleDismissInterrupted() {
    if (!interruptedExam) return;
    localStorage.removeItem(`p1_exam_${interruptedExam.paper.id}`);
    setInterruptedExam(null);
  }

  function handleModeSelect(mode) {
    if (!selectedPaper) return;
    setSelectedPaper(null);
    navigate("/physics/p1", {
      state: { paperId: selectedPaper.id, examMode: mode === "exam" }
    });
  }

  async function loadDashboardData() {
    setLoading(true);
    getStreakData().then(sd => setStreakData(sd));
    const writtenKeys = WRITTEN_KEYS_FOR_CONFIDENCE;
    const [rb, grb, mcqTopics, ...topicResults] = await Promise.all([
      getReviewBank(),
      getGuessReviewBank(),
      getMCQOnlyTopicNames(writtenKeys),
      ...writtenKeys.map(k => getTopicData(k)),
    ]);
    setReviewBank(rb);
    setGuessReviewBank(grb);
    const dataMap = {};
    writtenKeys.forEach((k, i) => { dataMap[k] = topicResults[i]; });
    const mcqResults = await Promise.all(mcqTopics.map(t => getTopicData(t.key)));
    mcqTopics.forEach((t, i) => { dataMap[t.key] = mcqResults[i]; });
    setMcqOnlyTopics(mcqTopics.filter((t, i) => mcqResults[i] !== null));
    setTopicData(dataMap);
    setLoading(false);
  }

  useEffect(() => {
    if (isLoadingProgress) return;
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, location.key, isLoadingProgress]);

  const onTouchStart = useCallback((e) => {
    if (window.scrollY === 0) startY.current = e.touches[0].clientY;
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
      await new Promise(r => setTimeout(r, 300));
      await loadDashboardData();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullY]);

  async function handleReset() {
    await resetData();
    await loadDashboardData();
  }

  const hasReviewBank = reviewBank.length > 0 || guessReviewBank.length > 0;

  const PAPER4_TOPICS = [
    { label: "Circular Motion",           key: "circular_motion",           route: "/circularmotion/question" },
    { label: "Gravitational Fields",      key: "gravitational_fields",      route: "/gravitational/question" },
    { label: "Thermal Physics",           key: "thermal_physics",           route: "/thermal/question" },
    { label: "Oscillations",              key: "oscillations",              route: "/oscillations/question" },
    { label: "Electric Fields",           key: "electric_fields",           route: "/electric/question" },
    { label: "Capacitance",               key: "capacitance",               route: "/capacitance/question" },
    { label: "Magnetic Fields",           key: "magnetic_fields",           route: null },
    { label: "Electromagnetic Induction", key: "electromagnetic_induction", route: "/eminduction/question" },
    { label: "Alternating Currents",      key: "alternating_currents",      route: null },
    { label: "Quantum Physics",           key: "quantum_physics",           route: "/quantum/question" },
    { label: "Nuclear Physics",           key: "nuclear_physics",           route: "/nuclear/question" },
    { label: "Medical Imaging",           key: "medical_imaging",           route: "/medicalimaging/question" },
    { label: "Astronomy & Cosmology",     key: "astrophysics",              route: "/astrophysics/question" },
  ];

  const AS_WRITTEN_TOPICS = [
    { label: "Physical Quantities & Units", key: "physical_quantities_units", route: "/physicalquantities/question" },
    { label: "Kinematics",                  key: "kinematics",                route: "/kinematics/question" },
    { label: "Forces & Equilibrium",        key: "forces_equilibrium",        route: "/forces/question" },
    { label: "Waves",                       key: "waves",                     route: "/waves/question" },
  ];

  return (
    <div
      className="min-h-screen bg-[#0d0d1a] text-white"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="flex items-center justify-center overflow-hidden transition-all duration-200 relative z-10"
        style={{ height: pullY > 0 || refreshing ? `${pullY}px` : 0 }}>
        <RefreshCw className={`w-5 h-5 text-emerald-400 transition-transform ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: !refreshing ? `rotate(${(pullY / PTR_THRESHOLD) * 360}deg)` : undefined }} />
      </div>

      <div className="relative z-10 w-full max-w-[540px] mx-auto flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Physics</span>
            <span className="text-[10px] text-white/30">9702</span>
          </div>
          <button onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-400">{avatarLetter}</span>
          </button>
        </div>

        {/* Overall confidence */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Overall confidence</span>
          {!loading && <OverallConfidence topicData={topicData} mcqOnlyTopics={mcqOnlyTopics} />}
        </div>

        <div className="flex flex-col gap-5 p-4 pt-6 pb-8">

          {/* Interrupted exam banner */}
          {interruptedExam && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/8 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-bold text-red-400">Interrupted Exam Detected</p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Your timed exam for <strong>{interruptedExam.paper.label}</strong> was interrupted. View your results now.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDismissInterrupted}
                  className="flex-1 text-xs font-semibold text-white/40 border border-white/10 py-2 rounded-xl hover:brightness-110 transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleViewInterruptedResults}
                  className="flex-1 text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 py-2 rounded-xl hover:brightness-110 transition-all"
                >
                  View Results →
                </button>
              </div>
            </div>
          )}

          {/* Today's Focus */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex items-center gap-4 opacity-60 cursor-not-allowed select-none">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-0.5">Today's Focus</p>
              <p className="text-sm text-white/30">AI-powered recommendations</p>
            </div>
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-emerald-400/60 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>

          {/* Past Papers */}
          <SectionDivider label="Past Papers" sublabel="Choose Practice or Timed Exam mode" />
          <div className="space-y-2">
            {P1_PAPERS.map(paper => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaper(paper)}
                className="w-full text-left rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 p-4 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{paper.label}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Paper 1 Multiple Choice · {paper.questions.length} questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">⏱ Exam</span>
                    <ChevronRight className="w-4 h-4 text-emerald-400/50" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Review Banks */}
          {hasReviewBank && (
            <>
              <SectionDivider label="Review Banks" sublabel="Spaced repetition · questions you missed" />
              {reviewBank.length > 0 && (
                <div onClick={() => navigate("/review-bank")}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/10 transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{reviewBank.length} written question{reviewBank.length !== 1 ? "s" : ""} in review bank</p>
                      <p className="text-[11px] text-white/40 mt-0.5 truncate">{reviewBankSubtitle(reviewBank)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
              )}
              {guessReviewBank.length > 0 && (
                <div onClick={() => navigate("/guess-review-bank")}
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
            </>
          )}

          {/* A Level Topics */}
          <SectionDivider label="A Level Topics" sublabel="Paper 4 written practice" />
          <div className="space-y-2">
            {PAPER4_TOPICS.map(({ label, key, route }) => {
              const data = topicData[key];
              if (!route) return (
                <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-40">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white/50 text-sm">{label}</p>
                    <Lock className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  </div>
                </div>
              );
              return (
                <div key={key} onClick={() => navigate(route)}
                  className="rounded-xl border border-white/8 bg-white/[0.03] hover:bg-emerald-500/5 hover:border-emerald-500/25 p-4 cursor-pointer transition-all">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 flex-1">
                      <p className="font-semibold text-white text-sm">{label}</p>
                      {data ? <TrendBadge trend={data.trend} /> : <span className="text-xs text-emerald-400/60 font-medium">Ready to start</span>}
                      {data && (
                        <div className="flex items-center gap-4">
                          {data.lastLabel && <span className="text-[11px] text-white/30">Last: {data.lastLabel}</span>}
                          {data.streak > 0 && <span className="flex items-center gap-1 text-[11px] text-white/30"><Flame className="w-3 h-3 text-orange-400/70" /> {data.streak}d streak</span>}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AS Topics */}
          <SectionDivider label="AS Level Topics" sublabel="Paper 2 written practice" />
          <div className="space-y-2">
            {AS_WRITTEN_TOPICS.map(({ label, key, route }) => {
              const data = topicData[key];
              return (
                <div key={key} onClick={() => navigate(route)}
                  className="rounded-xl border border-white/8 bg-white/[0.03] hover:bg-emerald-500/5 hover:border-emerald-500/25 p-4 cursor-pointer transition-all">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 flex-1">
                      <p className="font-semibold text-white text-sm">{label}</p>
                      {data ? <TrendBadge trend={data.trend} /> : <span className="text-xs text-emerald-400/60 font-medium">Ready to start</span>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* MCQ topics */}
          {mcqOnlyTopics.length > 0 && (
            <>
              <SectionDivider label="Multiple Choice Progress" sublabel="Topics you've attempted" />
              <div className="space-y-2">
                {mcqOnlyTopics.map(({ label, key }) => {
                  const data = topicData[key];
                  return (
                    <div key={key} onClick={() => navigate("/mcq", { state: { topic: label } })}
                      className="rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] p-4 cursor-pointer transition-all">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1">
                          <p className="font-semibold text-white text-sm">{label}</p>
                          {data ? <TrendBadge trend={data.trend} /> : <span className="text-xs text-emerald-400/60">Ready to start</span>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <SectionDivider label="Multiple Choice Topics" sublabel="Paper 1 topic practice" />
          <div className="space-y-2">
            {MCQ_ONLY_TOPICS.map((label) => (
              <div key={label} onClick={() => navigate("/mcq", { state: { topic: label } })}
                className="rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] p-4 cursor-pointer transition-all">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            {COMING_SOON.map((topic) => (
              <div key={topic} className="px-4 py-2.5 flex items-center justify-between opacity-25">
                <p className="text-sm text-white/50">{topic}</p>
                <span className="text-[10px] text-white/30">Coming soon</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button onClick={handleReset} className="text-[10px] text-white/15 hover:text-white/30 transition-colors">
              Reset data
            </button>
          </div>
        </div>
      </div>

      {/* P1 Mode Modal */}
      {selectedPaper && (
        <P1ModeModal
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onSelectMode={handleModeSelect}
        />
      )}
    </div>
  );
}