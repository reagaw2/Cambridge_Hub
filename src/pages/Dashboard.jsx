import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowRight, ArrowDown, Flame, Home, Clock, User, ChevronRight } from "lucide-react";

const COMING_SOON = [
  "Thermal Physics", "Oscillations", "Electric Fields", "Capacitance",
  "Magnetic Fields", "Electromagnetic Induction", "Quantum Physics",
  "Nuclear Physics", "Medical Physics", "Telecommunications",
  "Ideal Gases", "Waves", "Superposition", "Mechanics", "Circular Motion"
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning, Reagan. Let's build on yesterday.";
  if (h < 17) return "Good afternoon, Reagan. Your exam won't wait.";
  return "Good evening, Reagan. One more session before you rest.";
}

function getGFData() {
  const scores = JSON.parse(sessionStorage.getItem("gf_scores") ?? "[]");
  const streak = parseInt(sessionStorage.getItem("gf_streak") ?? "0", 10);
  const lastDate = sessionStorage.getItem("gf_last_attempt_date");

  if (scores.length === 0) {
    return { attempted: false, trend: null, streak: 0, lastDate: null };
  }

  const first = scores[0];
  const last = scores[scores.length - 1];
  let trend = "steady";
  if (last > first) trend = "improving";
  else if (last < first) trend = "needs_work";

  let lastLabel = null;
  if (lastDate) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const d = new Date(lastDate).toDateString();
    if (d === today) lastLabel = "today";
    else if (d === yesterday) lastLabel = "yesterday";
    else {
      const diff = Math.round((Date.now() - new Date(lastDate)) / 86400000);
      lastLabel = `${diff} days ago`;
    }
  }

  return { attempted: true, trend, streak, lastDate: lastLabel };
}

function TrendBadge({ trend }) {
  if (trend === "improving") return (
    <span className="flex items-center gap-1 text-xs font-medium text-primary">
      <ArrowUp className="w-3 h-3" /> Improving
    </span>
  );
  if (trend === "steady") return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
      <ArrowRight className="w-3 h-3" /> Steady
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-400">
      <ArrowDown className="w-3 h-3" /> Needs work
    </span>
  );
}

function RecommendationBanner({ trend, navigate }) {
  let text;
  if (!trend || trend === "needs_work") {
    text = "We recommend starting with Gravitational Fields today — it is a common exam topic and your data shows room to grow.";
  } else if (trend === "improving") {
    text = "You are making progress on Gravitational Fields. Push further today — consistency is what Cambridge rewards.";
  } else {
    text = "Gravitational Fields is looking solid. Consider revisiting it briefly then moving to a new topic.";
  }
  return (
    <div className="bg-card border border-border border-l-4 border-l-primary rounded-xl p-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Today's Focus</p>
      <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
      <button
        onClick={() => navigate("/question")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:brightness-110 transition-all"
      >
        Start session → 
      </button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const gf = getGFData();

  return (
    <div className="min-h-screen bg-background flex justify-center pb-24">
      <div className="w-full max-w-[480px] flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <span className="text-base font-bold tracking-wide text-foreground">ALA Hub</span>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">R</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 p-4 pt-6">

          {/* Greeting */}
          <p className="text-2xl font-serif font-semibold text-foreground leading-snug">
            {getGreeting()}
          </p>

          {/* Recommendation banner */}
          <RecommendationBanner trend={gf.attempted ? gf.trend : null} navigate={navigate} />

          {/* Topics section */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Your Topics</p>
            <p className="text-xs text-muted-foreground/60">Focus on trends, not totals.</p>
          </div>

          {/* Active topic — Gravitational Fields */}
          <div
            onClick={() => navigate("/question")}
            className="bg-card border border-border border-l-4 border-l-primary rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-foreground text-sm">Gravitational Fields</p>
                {gf.attempted ? (
                  <>
                    <TrendBadge trend={gf.trend} />
                    <div className="flex items-center gap-4 pt-1">
                      {gf.lastDate && (
                        <span className="text-[11px] text-muted-foreground">Last attempt: {gf.lastDate}</span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Flame className="w-3 h-3 text-orange-400/80" />
                        {gf.streak} day streak
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-primary/70 font-medium">Ready to start</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
            </div>
          </div>

          {/* Coming soon topics */}
          <div className="space-y-2">
            {COMING_SOON.map(topic => (
              <div
                key={topic}
                className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between opacity-50"
              >
                <p className="text-sm text-muted-foreground font-medium">{topic}</p>
                <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center px-4 py-3 z-50">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium text-primary">Home</span>
        </button>
        <button
          className="flex flex-col items-center gap-1"
          onClick={() => alert("History coming soon")}
        >
          <Clock className="w-5 h-5 text-muted-foreground/50" />
          <span className="text-[10px] font-medium text-muted-foreground/50">History</span>
        </button>
        <button
          className="flex flex-col items-center gap-1"
          onClick={() => alert("Profile coming soon")}
        >
          <User className="w-5 h-5 text-muted-foreground/50" />
          <span className="text-[10px] font-medium text-muted-foreground/50">Profile</span>
        </button>
      </div>
    </div>
  );
}