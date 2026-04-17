import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDisplayName } from "@/lib/useDisplayName";
import { getTopicData, getMCQOnlyTopicNames } from "@/lib/topicStore";
import { csGetTopicData } from "@/lib/csTopicStore";
import { Atom, Lock, Code2 } from "lucide-react";
import { toast } from "sonner";

function getGreeting(name) {
  const h = new Date().getHours();
  const n = name || "there";
  if (h < 12) return `Good morning, ${n}. What are you studying today?`;
  if (h < 17) return `Good afternoon, ${n}. What are you studying today?`;
  return `Good evening, ${n}. What are you studying today?`;
}

const WRITTEN_KEYS = [
  "gravitational_fields", "nuclear_physics", "thermal_physics", "oscillations",
  "electric_fields", "capacitance", "electromagnetic_induction", "quantum_physics", "astrophysics",
];

function ConfidenceScore({ score }) {
  if (score === null) return <span className="text-xs text-muted-foreground">Not started</span>;
  const color = score >= 70 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  return <span className={`text-sm font-bold ${color}`}>{score}%</span>;
}

export default function SubjectSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { displayName, avatarLetter } = useDisplayName();
  const [physicsScore, setPhysicsScore] = useState(null);
  const [physicsLoaded, setPhysicsLoaded] = useState(false);
  const [csScore, setCsScore] = useState(null);
  const [csLoaded, setCsLoaded] = useState(false);

  const CS_ACTIVE_KEYS = ["data_representation", "compression", "computers_and_components", "operating_systems", "language_translators"];

  const trendToScore = (trend) => {
    if (trend === "improving") return 85;
    if (trend === "steady") return 60;
    return 30;
  };

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
    calcPhysicsScore();
    calcCSScore();
  }, [user?.email]);

  function handleLocked() {
    toast("Coming soon. Focus on Physics for now.", { duration: 2500 });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="w-8" />
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
          <div>
            <p className="text-2xl font-serif font-semibold text-foreground leading-snug">
              {getGreeting(displayName)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Choose a subject to begin your session.</p>
          </div>

          {/* Subject cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

            {/* Physics — active */}
            <button
              onClick={() => navigate("/physics")}
              className="relative flex flex-col justify-between rounded-xl border border-border border-l-4 border-l-primary bg-card p-4 text-left hover:brightness-110 active:scale-[0.98] transition-all"
              style={{ minHeight: 140 }}
            >
              <div className="space-y-1">
                <Atom className="w-6 h-6 text-primary mb-2" />
                <p className="font-bold text-foreground text-sm">Physics</p>
                <p className="text-[11px] text-muted-foreground">9702 · A Level</p>
              </div>
              <div className="mt-3">
                {physicsLoaded ? <ConfidenceScore score={physicsScore} /> : (
                  <span className="text-xs text-muted-foreground/40">Loading...</span>
                )}
              </div>
            </button>

            {/* Mathematics — locked */}
            <button
              onClick={handleLocked}
              className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left opacity-50 cursor-default"
              style={{ minHeight: 140 }}
            >
              <div className="absolute top-2 right-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <div className="space-y-1">
                <span className="text-2xl mb-2 block">∑</span>
                <p className="font-bold text-muted-foreground text-sm">Mathematics</p>
                <p className="text-[11px] text-muted-foreground/60">9709 · A Level</p>
              </div>
              <p className="text-[11px] text-amber-500/70 mt-3 font-medium">Coming soon</p>
            </button>

            {/* Computer Science — active */}
            <button
              onClick={() => navigate("/cs")}
              className="relative flex flex-col justify-between rounded-xl border border-border border-l-4 border-l-blue-500 bg-card p-4 text-left hover:brightness-110 active:scale-[0.98] transition-all"
              style={{ minHeight: 140 }}
            >
              <div className="space-y-1">
                <Code2 className="w-6 h-6 text-blue-400 mb-2" />
                <p className="font-bold text-foreground text-sm">Computer Science</p>
                <p className="text-[11px] text-muted-foreground">9618 · A Level</p>
              </div>
              <div className="mt-3">
                {csLoaded ? <ConfidenceScore score={csScore} /> : (
                  <span className="text-xs text-muted-foreground/40">Loading...</span>
                )}
              </div>
            </button>

          </div>

          <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed">
            More subjects coming soon — Mathematics, Chemistry, Biology.
          </p>

        </div>
      </div>
    </div>
  );
}