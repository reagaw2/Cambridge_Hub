import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { getTopicData, resetData, getReviewBank, getGuessReviewBank, getMCQOnlyTopicNames, normaliseTopicKey } from "../lib/topicStore";
import { ArrowUp, ArrowRight, ArrowDown, Flame, ChevronRight, Bookmark, RefreshCw } from "lucide-react";

function BookmarkIcon() {
  return <Bookmark className="w-4 h-4 text-amber-400/80 shrink-0" />;
}

const MCQ_ONLY_TOPICS = [
  "Physical Quantities & Units",
  "Dynamics & Newton's Laws",
  "Momentum & Collisions",
  "Forces, Torques & Equilibrium",
  "Work, Energy & Power",
  "Deformation of Solids",
  "Waves",
  "Electricity",
  "Nuclear Physics & Particle Physics",
];

const COMING_SOON = [
  "Magnetic Fields", "Medical Physics", "Telecommunications",
  "Ideal Gases", "Superposition", "Mechanics", "Circular Motion",
];

function getGreeting(firstName) {
  const name = firstName || "there";
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}. Let's build on yesterday.`;
  if (h < 17) return `Good afternoon, ${name}. Your exam won't wait.`;
  return `Good evening, ${name}. One more session before you rest.`;
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
    </div>);
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

const WRITTEN_TOPICS = [
  { label: "Gravitational Fields", key: "gravitational_fields", route: "/gravitational/question" },
  { label: "Nuclear Physics", key: "nuclear_physics", route: "/nuclear/question" },
  { label: "Thermal Physics", key: "thermal_physics", route: "/thermal/question" },
  { label: "Oscillations", key: "oscillations", route: "/oscillations/question" },
  { label: "Electric Fields", key: "electric_fields", route: "/electric/question" },
  { label: "Capacitance", key: "capacitance", route: "/capacitance/question" },
  { label: "Electromagnetic Induction", key: "electromagnetic_induction", route: "/eminduction/question" },
  { label: "Quantum Physics", key: "quantum_physics", route: "/quantum/question" },
  { label: "Astrophysics", key: "astrophysics", route: "/astrophysics/question" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoadingProgress } = useAuth();
  const [topicData, setTopicData] = useState({});
  const [mcqOnlyTopics, setMcqOnlyTopics] = useState([]);
  const [reviewBank, setReviewBank] = useState([]);
  const [guessReviewBank, setGuessReviewBank] = useState([]);
  const [loading, setLoading] = useState(true);

  const { displayName, avatarLetter } = useDisplayName();

  async function loadDashboardData() {
    setLoading(true);
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
          <span className="text-base font-bold tracking-wide text-foreground">Cambridge Hub</span>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
          >
            <span className="text-xs font-bold text-primary">{avatarLetter}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-6 p-4 pt-6">

          {/* Greeting */}
          <p className="text-2xl font-serif font-semibold text-foreground leading-snug">
            {getGreeting(displayName)}
          </p>

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
                onClick={() => navigate("/review")}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <BookmarkIcon />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {reviewBank.length} question{reviewBank.length !== 1 ? "s" : ""} need another attempt
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {reviewBank[0].topic} · Added {reviewBank[0].date_added === new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) ? "today" : reviewBank[0].date_added}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/review"); }}
                  className="text-xs font-semibold text-amber-400 shrink-0 hover:brightness-110 transition-all">
                  Review now →
                </button>
              </div>
            </div>
          }

          {/* Guess Review Bank */}
          {guessReviewBank.length > 0 && (
            <div className="space-y-2">
              <div
                className="bg-card border border-border border-l-4 border-l-amber-500/60 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:brightness-110 transition-all"
                onClick={() => navigate("/mcq", { state: { topic: null, guessReviewMode: true, guessReviewBank } })}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-base shrink-0">🎲</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {guessReviewBank.length} MCQ question{guessReviewBank.length !== 1 ? "s" : ""} flagged as guesses
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Correct guesses are unverified — prove you know them
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/mcq", { state: { topic: null, guessReviewMode: true, guessReviewBank } }); }}
                  className="text-xs font-semibold text-amber-400 shrink-0 hover:brightness-110 transition-all"
                >
                  Review now →
                </button>
              </div>
            </div>
          )}

          {/* Topics section */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Your Topics</p>
            <p className="text-xs text-muted-foreground/60">Focus on trends, not totals.</p>
          </div>

          {WRITTEN_TOPICS.map(({ label, key, route }) => {
            const data = topicData[key];
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