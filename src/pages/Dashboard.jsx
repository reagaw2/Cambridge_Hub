import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { getTopicData, resetData, getReviewBank, getGuessReviewBank, getMCQOnlyTopicNames, normaliseTopicKey } from "../lib/topicStore";
import { ArrowUp, ArrowRight, ArrowDown, Flame, ChevronRight, Bookmark, RefreshCw, ArrowLeft, Lock } from "lucide-react";
import GlobalStreakBadge from "@/components/GlobalStreakBadge";
import { getStreakData } from "@/lib/topicStore";

function BookmarkIcon() {
  return <Bookmark className="w-4 h-4 text-amber-400/80 shrink-0" />;
}

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
  "Medical Physics", "Telecommunications",
  "Ideal Gases", "Superposition", "Mechanics",
];

function getGreeting(firstName) {
  const name = firstName || "there";
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}. Let's build on yesterday.`;
  if (h < 17) return `Good afternoon, ${name}. Your exam won't wait.`;
  return `Good evening, ${name}. One more session before you rest.`;
}

const WRITTEN_KEYS_FOR_CONFIDENCE = [
  "physical_quantities_units", "kinematics", "forces_equilibrium", "waves",
  "circular_motion", "gravitational_fields", "thermal_physics", "oscillations",
  "electric_fields", "capacitance", "magnetic_fields", "electromagnetic_induction",
  "alternating_currents", "quantum_physics", "nuclear_physics", "medical_imaging", "astrophysics",
];

function trendToScore(trend) {
  if (trend === "improving") return 85;
  if (trend === "steady") return 60;
  return 30;
}

function OverallConfidence({ topicData, mcqOnlyTopics }) {
  const allData = [
    ...WRITTEN_KEYS_FOR_CONFIDENCE.map(k => topicData[k]),
    ...mcqOnlyTopics.map(t => topicData[t.key]),
  ].filter(Boolean);

  if (allData.length === 0) {
    return <span className="text-xs text-muted-foreground/60">No data yet</span>;
  }
  const avg = Math.round(allData.reduce((sum, d) => sum + trendToScore(d.trend), 0) / allData.length);
  const color = avg >= 70 ? "text-green-400" : avg >= 50 ? "text-amber-400" : "text-red-400";
  return <span className={`text-sm font-bold ${color}`}>{avg}%</span>;
}

function TrendBadge({ trend }) {
  if (trend === "improving") return (
    <span className="flex items-center gap-1 text-xs font-medium text-primary">
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

function RecommendationBanner({ trend, navigate }) {
  let text;
  if (trend === "improving") {
    text = "You are making progress on Gravitational Fields. Push further today — consistency is what Cambridge rewards.";
  } else {
    text = "We recommend starting with Gravitational Fields today — it is a common exam topic and your data shows room to grow.";
  }
  return (
    <div className="bg-card border border-border border-l-4 border-l-primary rounded-xl p-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Today's Focus</p>
      <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
      <button
        onClick={() => navigate("/gravitational/question")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:brightness-110 transition-all">
        Start session →
      </button>
    </div>
  );
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

// A Level Paper 4 topics — canonical order, keys must never be renamed
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

// Combined for data-fetching — includes legacy AS written keys
const AS_WRITTEN_TOPICS = [
  { label: "Physical Quantities & Units", key: "physical_quantities_units", route: "/physicalquantities/question" },
  { label: "Kinematics",                  key: "kinematics",                route: "/kinematics/question" },
  { label: "Forces & Equilibrium",        key: "forces_equilibrium",        route: "/forces/question" },
  { label: "Waves",                       key: "waves",                     route: "/waves/question" },
];

const WRITTEN_TOPICS = [...AS_WRITTEN_TOPICS, ...PAPER4_TOPICS];

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

  const { displayName, avatarLetter } = useDisplayName();

  async function loadDashboardData() {
    setLoading(true);
    getStreakData().then(sd => setStreakData(sd));
    const writtenKeys = WRITTEN_TOPICS.map(t => t.key);
    const [rb, grb, mcqTopics, ...topicResults] = await Promise.all([
      getReviewBank(),
      getGuessReviewBank(),
      getMCQOnlyTopicNames(writtenKeys),
      ...WRITTEN_TOPICS.map(t => getTopicData(t.key)),
    ]);
    setReviewBank(rb);
    setGuessReviewBank(grb);
    const dataMap = {};
    WRITTEN_TOPICS.forEach((t, i) => { dataMap[t.key] = topicResults[i]; });

    // Fetch data for MCQ-only topics that have attempts
    const mcqResults = await Promise.all(mcqTopics.map(t => getTopicData(t.key)));
    mcqTopics.forEach((t, i) => { dataMap[t.key] = mcqResults[i]; });
    setMcqOnlyTopics(mcqTopics.filter((t, i) => mcqResults[i] !== null));

    setTopicData(dataMap);
    setLoading(false);
  }

  // Wait for preload to complete, then load dashboard data
  // Also reload whenever the user navigates back (location.key changes)
  useEffect(() => {
    if (isLoadingProgress) return; // wait for preload
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, location.key, isLoadingProgress]);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 300));
    await loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const { containerRef, pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(handleRefresh);

  async function handleReset() {
    await resetData();
    await loadDashboardData();
  }



  const gf = topicData["gravitational_fields"];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div
        ref={containerRef}
        className="w-full max-w-[480px] flex flex-col overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: pullY > 0 ? "none" : "auto" }}
      >
        {/* Pull-to-refresh indicator */}
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{ height: pullY > 0 || refreshing ? `${pullY}px` : 0 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: !refreshing ? `rotate(${(pullY / PTR_THRESHOLD) * 360}deg)` : undefined }}
          />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Physics</span>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
          >
            <span className="text-xs font-bold text-primary">{avatarLetter}</span>
          </button>
        </div>

        {/* Overall confidence row */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-card/40">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Overall confidence</span>
          {!loading && <OverallConfidence topicData={topicData} mcqOnlyTopics={mcqOnlyTopics} />}
        </div>

        <div className="flex-1 flex flex-col gap-6 p-4 pt-6">

          {/* Greeting */}
          <p className="text-2xl font-serif font-semibold text-foreground leading-snug">
            {getGreeting(displayName)}
          </p>

          {/* Global streak */}
          {streakData && (streakData.global_streak > 0 || (streakData.daily_question_count?.count ?? 0) > 0) && (
            <div className="flex justify-center">
              <GlobalStreakBadge streakData={streakData} />
            </div>
          )}

          {/* Recommendation banner */}
          <RecommendationBanner trend={gf ? gf.trend : null} navigate={navigate} />

          {/* Review Bank */}
          {reviewBank.length > 0 &&
            <div className="space-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Review Bank</p>
                <p className="text-xs text-muted-foreground/60">Questions waiting to be mastered.</p>
              </div>
              <div
                className="bg-card border border-border border-l-4 border-l-amber-500/60 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:brightness-110 transition-all"
                onClick={() => navigate("/review-bank")}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <BookmarkIcon />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {reviewBank.length} question{reviewBank.length !== 1 ? "s" : ""} in review bank
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {reviewBankSubtitle(reviewBank)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/review-bank"); }}
                  className="text-xs font-semibold text-amber-400 shrink-0 hover:brightness-110 transition-all">
                  View →
                </button>
              </div>
            </div>
          }

          {/* Guess Review Bank */}
          {guessReviewBank.length > 0 && (
            <div className="space-y-2">
              <div
                className="bg-card border border-border border-l-4 border-l-amber-500/60 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:brightness-110 transition-all"
                onClick={() => navigate("/guess-review-bank")}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-base shrink-0">🎲</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {guessReviewBank.length} MCQ question{guessReviewBank.length !== 1 ? "s" : ""} flagged as guesses
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {guessBankSubtitle(guessReviewBank)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/guess-review-bank"); }}
                  className="text-xs font-semibold text-amber-400 shrink-0 hover:brightness-110 transition-all"
                >
                  View →
                </button>
              </div>
            </div>
          )}

          {/* A Level Topics — Paper 4, canonical syllabus order */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">A Level Topics</p>
            <p className="text-xs text-muted-foreground/60">Paper 4 · Cambridge 9702</p>
          </div>

          {PAPER4_TOPICS.map(({ label, key, route }) => {
            const data = topicData[key];
            if (!route) {
              return (
                <div key={key} className="bg-card border border-border rounded-xl p-4 opacity-40">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-muted-foreground text-sm">{label}</p>
                      <p className="text-[11px] text-muted-foreground/50 font-medium">No questions yet</p>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  </div>
                </div>
              );
            }
            return (
              <div
                key={key}
                onClick={() => navigate(route)}
                className="bg-card border border-border border-l-4 border-l-primary rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-foreground text-sm">{label}</p>
                    {data ? (
                      <>
                        <TrendBadge trend={data.trend} />
                        <div className="flex items-center gap-4 pt-1">
                          {data.lastLabel && (
                            <span className="text-[11px] text-muted-foreground">Last attempt: {data.lastLabel}</span>
                          )}
                          {data.streak > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Flame className="w-3 h-3 text-orange-400/80" />
                              {data.streak} day streak
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-primary/70 font-medium">Ready to start</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                </div>
              </div>
            );
          })}

          {/* MCQ-only topics with attempts */}
          {mcqOnlyTopics.length > 0 && (
            <>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Multiple Choice Progress</p>
                <p className="text-xs text-muted-foreground/60">Topics you have practised via MCQ.</p>
              </div>
              {mcqOnlyTopics.map(({ label, key }) => {
                const data = topicData[key];
                return (
                  <div
                    key={key}
                    onClick={() => navigate("/mcq", { state: { topic: label } })}
                    className="bg-card border border-border border-l-4 border-l-primary rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="font-semibold text-foreground text-sm">{label}</p>
                        {data ? (
                          <>
                            <TrendBadge trend={data.trend} />
                            <div className="flex items-center gap-4 pt-1">
                              {data.lastLabel && (
                                <span className="text-[11px] text-muted-foreground">Last attempt: {data.lastLabel}</span>
                              )}
                              {data.streak > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Flame className="w-3 h-3 text-orange-400/80" />
                                  {data.streak} day streak
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-primary/70 font-medium">Ready to start</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* MCQ-only topics */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Multiple Choice Topics</p>
            <p className="text-xs text-muted-foreground/60">AS Level MCQ practice — no written questions yet.</p>
          </div>

          {MCQ_ONLY_TOPICS.map((label) => (
            <div
              key={label}
              onClick={() => navigate("/mcq", { state: { topic: label } })}
              className="bg-card border border-border border-l-4 border-l-primary rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <span className="text-xs text-primary/70 font-medium">Ready to start</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
              </div>
            </div>
          ))}

          {/* Reset button */}
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={handleReset}
              className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
              Reset data
            </button>
          </div>

          {/* Coming soon */}
          <div className="space-y-1.5">
            {COMING_SOON.map((topic) =>
              <div key={topic} className="px-4 py-3 flex items-center justify-between opacity-35">
                <p className="text-sm text-muted-foreground/70">{topic}</p>
                <span className="text-[10px] text-muted-foreground/50">Coming soon</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}