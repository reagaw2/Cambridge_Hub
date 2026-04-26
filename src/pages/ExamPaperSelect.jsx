/**
 * ExamPaperSelect — let the student choose subject, session, variant
 * then begin or resume a past paper exam.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, FileText, Play, RotateCcw } from "lucide-react";
import { PAPERS, SESSIONS, PHYSICS_VARIANTS, CS_VARIANTS, getPapersForSubjectAndSession } from "@/lib/examPapers";
import { getPausedSession, getAnyPausedSession } from "@/lib/examStore";

function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, "0")).join(":");
}

export default function ExamPaperSelect() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("physics");
  const [session, setSession] = useState("Nov 2025");
  const [variant, setVariant] = useState("41");
  const [pausedSession, setPausedSession] = useState(null);
  const [anyPaused, setAnyPaused] = useState(null);
  const [loadingPaused, setLoadingPaused] = useState(true);

  const variants = subject === "physics" ? PHYSICS_VARIANTS : CS_VARIANTS;
  const selectedPaper = PAPERS.find(
    p => p.subject === subject && p.session === session && p.variant === variant
  ) ?? null;

  // Check for paused sessions
  useEffect(() => {
    setLoadingPaused(true);
    getAnyPausedSession().then(s => {
      setAnyPaused(s);
      setLoadingPaused(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedPaper) { setPausedSession(null); return; }
    getPausedSession(selectedPaper.id).then(setPausedSession);
  }, [selectedPaper?.id]);

  // Reset variant when subject changes
  useEffect(() => {
    setVariant(subject === "physics" ? "41" : "21");
  }, [subject]);

  function handleBegin(fresh = false) {
    if (!selectedPaper) return;
    navigate("/exam/session", {
      state: {
        paperId: selectedPaper.id,
        fresh,
      }
    });
  }

  const selectClass = "w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Past Paper Mode</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6">

          <div>
            <p className="text-xl font-serif font-semibold text-foreground">Select a paper</p>
            <p className="text-sm text-muted-foreground mt-1">Attempt a full paper under timed exam conditions.</p>
          </div>

          {/* Any paused session warning */}
          {!loadingPaused && anyPaused && anyPaused.paper !== selectedPaper?.id && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-amber-400">Paused session active</p>
              <p className="text-[11px] text-foreground/70">You have a paused session for <span className="font-medium">{anyPaused.paper}</span>. Resume or complete it before starting a new paper.</p>
              <button
                onClick={() => navigate("/exam/session", { state: { paperId: anyPaused.paper, fresh: false } })}
                className="text-xs text-amber-400 font-semibold hover:brightness-110 transition-all"
              >
                Resume paused session →
              </button>
            </div>
          )}

          {/* Subject picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Subject</label>
            <div className="grid grid-cols-2 gap-2">
              {["physics", "cs"].map(s => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    subject === s
                      ? "bg-primary/15 border-primary/50 text-primary"
                      : "bg-card border-border text-muted-foreground hover:brightness-110"
                  }`}
                >
                  {s === "physics" ? "Physics (9702)" : "Comp. Sci. (9618)"}
                </button>
              ))}
            </div>
          </div>

          {/* Session picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Session</label>
            <select value={session} onChange={e => setSession(e.target.value)} className={selectClass}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Variant picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Variant</label>
            <div className="grid grid-cols-3 gap-2">
              {variants.map(v => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    variant === v
                      ? "bg-primary/15 border-primary/50 text-primary"
                      : "bg-card border-border text-muted-foreground hover:brightness-110"
                  }`}
                >
                  /{v}
                </button>
              ))}
            </div>
          </div>

          {/* Paper info card */}
          {selectedPaper ? (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <p className="font-bold text-foreground">{selectedPaper.id}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{selectedPaper.questions.length} question{selectedPaper.questions.length !== 1 ? "s" : ""} available</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedPaper.estimatedHours}h suggested
                </span>
              </div>

              {/* Paused session for this paper */}
              {pausedSession ? (
                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Session Paused</p>
                    <p className="text-sm text-foreground font-medium">
                      ⏱ {formatSeconds(pausedSession.time_remaining_seconds)} remaining · Q{pausedSession.current_question_index + 1} of {pausedSession.answers.length}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBegin(false)}
                    disabled={anyPaused && anyPaused.paper !== selectedPaper.id}
                    className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Resume Exam
                  </button>
                  <button
                    onClick={() => handleBegin(true)}
                    className="w-full bg-secondary border border-border text-secondary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Start Fresh
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleBegin(true)}
                  disabled={!loadingPaused && anyPaused && anyPaused.paper !== selectedPaper?.id}
                  className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Begin Exam
                </button>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-xl p-5 text-center text-sm text-muted-foreground">
              No paper available for that combination yet. Try a different variant or session.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}