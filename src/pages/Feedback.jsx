import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Star, AlertTriangle, Check } from "lucide-react";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "../lib/topicStore";
import { getAllNotes, saveNote } from "@/lib/questionNotesStore";
import { isStarred, starQuestion, unstarQuestion } from "@/lib/writtenStarStore";
import { loadWorkings as loadTopicWorkings, saveWorking as saveTopicWorking } from "@/lib/p1WorkingsStore";
import ScratchpadPanel from "@/components/ScratchpadPanel";

// ── MY NOTE inline widget — matching screenshot exactly ──────────────────────
function MyNoteWidget({ questionId, topic, questionText }) {
  const existing = getAllNotes()[questionId];
  const [editing, setEditing] = useState(!existing?.text);
  const [text, setText] = useState(existing?.text ?? "");
  const [saved, setSaved] = useState(false);

  if (!editing && existing?.text) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary">✎</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p>
          </div>
          <button onClick={() => setEditing(true)} className="text-[11px] text-primary hover:brightness-110 transition-all">Edit</button>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{existing.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary">✎</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p>
        </div>
        {existing?.text && (
          <button onClick={() => { setEditing(false); setText(existing.text); }} className="text-[11px] text-muted-foreground hover:text-foreground transition-all">Cancel</button>
        )}
      </div>
      <div className="p-3 space-y-2">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setSaved(false); }}
          placeholder="Add a note — what clicked? What was the key idea?"
          rows={3}
          autoFocus={editing && !existing?.text}
          className="w-full bg-secondary/40 border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/30">Saved notes appear in the Notes panel</p>
          <button
            onClick={() => {
              saveNote(questionId, text, { topic, questionText: (questionText ?? "").slice(0, 200) });
              setSaved(true);
              setEditing(false);
              setTimeout(() => setSaved(false), 2000);
            }}
            disabled={!text.trim()}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:brightness-110 bg-primary/15 px-3 py-1.5 rounded-lg border border-primary/30 disabled:opacity-40 transition-all"
          >
            {saved ? <><Check className="w-3 h-3" /> Saved</> : "Save note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Star for teacher review ───────────────────────────────────────────────────
function StarButton({ questionId, topic, questionText, markScheme, feedback, answer }) {
  const [starred, setStarred] = useState(() => isStarred(questionId ?? ""));

  function handleToggle() {
    if (!questionId) return;
    if (starred) {
      unstarQuestion(questionId);
      setStarred(false);
    } else {
      starQuestion(questionId, {
        topic, questionText, markScheme,
        feedback: { pulse_layer_1: feedback?.pulse_layer_1, cambridge_insight: feedback?.cambridge_insight },
        answer: answer ?? "",
      });
      setStarred(true);
    }
  }

  return (
    <button onClick={handleToggle}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm transition-all active:scale-[0.98] ${
        starred
          ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
          : "bg-card border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5"
      }`}
    >
      <Star className={`w-4 h-4 ${starred ? "fill-amber-400" : ""}`} />
      {starred ? "Starred for teacher review" : "Star for teacher review"}
    </button>
  );
}

// ── Show deeper breakdown ────────────────────────────────────────────────────
function DeeperBreakdown({ feedback }) {
  const [open, setOpen] = useState(false);
  const markRows = Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([, val], i) => ({ ...val, notation: val.notation ?? `B${i + 1}` }));

  if (markRows.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all">
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {open ? "Hide" : "Show"} deeper breakdown
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-2.5">
          {markRows.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border ${
              m.earned ? "bg-green-500/[0.07] border-green-500/20" : "bg-red-500/[0.07] border-red-500/20"
            }`}>
              <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border leading-none shrink-0 mt-0.5 ${
                m.earned ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/15 text-red-300 border-red-500/25"
              }`}>{m.notation}</span>
              <div className="flex-1 min-w-0 space-y-1">
                <p className={`text-xs font-semibold leading-snug ${m.earned ? "text-green-200" : "text-red-200"}`}>
                  {m.earned ? "✓" : "✗"} {m.keyword ?? ""}
                </p>
                {m.feedback && <p className="text-[11px] text-white/40 leading-relaxed">{m.feedback}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Feedback page ───────────────────────────────────────────────────────
export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback, answer, isQ3, student_prediction, isReview,
    isPersistentMisunderstanding,
    topicKey, questionId, questionText, markScheme, topicLabel,
    nextFullRoute, nextRetryRoute, backRoute, paperRef
  } = state || {};

  const resolvedTopicKey = topicKey ?? "gravitational_fields";
  const resolvedBack = backRoute ?? "/physics";
  const maxMarks = feedback ? Math.max(...Object.keys(feedback).filter(k => /^mark_\d+$/.test(k)).map(k => parseInt(k.split("_")[1])), 0) || (isQ3 ? 1 : 2) : 2;
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;

  const [workings, setWorkings] = useState({});

  useEffect(() => {
    if (topicKey) loadTopicWorkings(topicKey).then(w => setWorkings(w ?? {}));
  }, [topicKey]);

  function handleSaveWorking(side, imageData) {
    if (!topicKey || !questionId) return;
    const updated = saveTopicWorking(topicKey, questionId, side, imageData);
    setWorkings({ ...updated });
  }

  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned, { total_marks: maxMarks, question_id: questionId });
        if (!fullMarks && questionId) {
          writeMistakeDna(feedback, questionId, resolvedTopicKey, marksEarned, maxMarks, answer ?? "").catch(() => {});
          addToReviewBank({
            question_id: questionId,
            topic: topicLabel ?? resolvedTopicKey,
            question_text: questionText ?? "",
            mark_scheme: markScheme ?? "",
            total_marks: maxMarks,
            first_attempt_score: marksEarned,
            first_attempt_feedback: feedback.cambridge_insight ?? "",
            first_attempt_answer: answer ?? "",
          }).catch(() => {});
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback) return null;

  const takeaway = feedback.pulse_layer_1 ?? feedback.step6_takeaway ?? feedback.next_step ?? null;
  const insight = feedback.cambridge_insight ?? null;

  function handleNext() {
    if (isReview) { navigate("/review"); return; }
    const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + (fullMarks ? 1 : 0);
    sessionStorage.setItem("previous_score", String(marksEarned));
    if (fullMarks) {
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(
        parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1
      ));
      navigate(nextFullRoute ?? "/physics");
    } else {
      sessionStorage.setItem("consecutive_full_marks", "0");
      navigate(nextRetryRoute ?? "/physics");
    }
  }

  const buttonLabel = isReview
    ? (fullMarks ? "Next review question →" : "Try again")
    : (fullMarks ? "Next question →" : "Try Again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9702/44"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-3 p-4 pb-8">

          {/* Persistent warning */}
          {isPersistentMisunderstanding && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-400">⚠ Persistent Misunderstanding</p>
                <p className="text-xs text-foreground/70 leading-relaxed mt-0.5">
                  You gave a similar answer to last time. Study the Cambridge Insight carefully before trying again.
                </p>
              </div>
            </div>
          )}

          {/* Student's answer */}
          {answer && (
            <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{answer}</p>
            </div>
          )}

          {/* Result banner */}
          <div className={`rounded-xl border px-4 py-3.5 flex items-center justify-between ${
            fullMarks ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fullMarks ? "✅" : "❌"}</span>
              <div>
                <p className={`text-sm font-bold ${fullMarks ? "text-green-400" : "text-red-400"}`}>
                  {fullMarks ? "Correct" : "Incorrect"}
                </p>
                {!fullMarks && !isReview && (
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Added to your review bank</p>
                )}
              </div>
            </div>
            <p className={`text-xl font-black tabular-nums ${fullMarks ? "text-green-400" : "text-amber-400"}`}>
              {marksEarned}<span className="text-sm text-muted-foreground font-normal">/{maxMarks}</span>
            </p>
          </div>

          {/* THE EXAM TAKEAWAY */}
          {takeaway && (
            <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 overflow-hidden">
              <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/70 mb-2 flex items-center gap-2">
                <span>📌</span> The Exam Takeaway
              </p>
              <p className="text-sm font-bold text-white leading-snug relative">{takeaway}</p>
            </div>
          )}

          {/* CAMBRIDGE INSIGHT */}
          {insight && (
            <div className="bg-card border border-border rounded-xl px-4 py-3.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </div>
          )}

          {/* MY NOTE — inline editable, matching screenshot */}
          <MyNoteWidget
            questionId={questionId ?? "unknown"}
            topic={topicLabel ?? resolvedTopicKey}
            questionText={questionText ?? ""}
          />

          {/* Star for teacher review */}
          <StarButton
            questionId={questionId}
            topic={topicLabel ?? resolvedTopicKey}
            questionText={questionText ?? ""}
            markScheme={markScheme ?? ""}
            feedback={feedback}
            answer={answer ?? ""}
          />

          {/* Prediction feedback (Q3) */}
          {isQ3 && student_prediction && feedback.prediction_feedback && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Prediction</p>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

          {/* Show deeper breakdown — collapsible */}
          <DeeperBreakdown feedback={feedback} />

          {/* Next button */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button onClick={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)}
              className="flex items-center justify-center gap-1 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
              ‹ Previous
            </button>
            <button onClick={handleNext}
              className="bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
              {buttonLabel}
            </button>
          </div>

        </div>
      </div>

      {/* Side scratchpad panels — continuous with the question page */}
      <ScratchpadPanel
        questionId={questionId}
        paperId={resolvedTopicKey}
        workings={workings}
        onSaveWorking={handleSaveWorking}
      />
    </div>
  );
}