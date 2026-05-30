import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Star, AlertTriangle } from "lucide-react";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "../lib/topicStore";
import { getAllNotes } from "@/lib/questionNotesStore";
import { saveNote } from "@/lib/questionNotesStore";
import { isStarred, toggleStar } from "@/lib/writtenStarStore";
import { detectSubject } from "@/lib/pulsePromptBuilder";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import QuestionMedia from "@/components/QuestionMedia";
import QuestionSessionHeader from "@/components/QuestionSessionHeader";

// ── Metadata for known questions ───────────────────────────────────────────
const QUESTION_META = {
  "9702-22-W19-Q1a": { question_id: "9702-22-W19-Q1a", topic: "Physical Quantities & Units", question_text: "Distinguish between vector and scalar quantities.", mark_scheme: "B1: a scalar quantity has magnitude only. B1: a vector quantity has both magnitude and direction.", total_marks: 2 },
  "9702-41-W19-Q2a": { question_id: "9702-41-W19-Q2a", topic: "Thermal Physics", question_text: "State the assumption of kinetic theory that is related to the volume of the molecules of the gas.", mark_scheme: "M1: volume of molecules is negligible. A1: compared with the volume occupied by the gas.", total_marks: 2 },
  "w25_44_Q8a": { question_id: "w25_44_Q8a", topic: "Nuclear Physics", question_text: "State what is meant by a tracer.", mark_scheme: "B1: radioactive substance introduced into the body. B1: absorbed by tissues being studied.", total_marks: 2 },
  "w25_44_Q1a": { question_id: "w25_44_Q1a", topic: "Gravitational Fields", question_text: "State Newton's law of gravitation.", mark_scheme: "B1: proportional to product of masses. B1: inversely proportional to square of separation.", total_marks: 2 },
  "w25_44_Q3a": { question_id: "w25_44_Q3a", topic: "Thermal Physics", question_text: "Explain what is meant by the internal energy of an ideal gas.", mark_scheme: "B1: total KE of random motion. B1: PE is zero.", total_marks: 2 },
  "w25_44_Q7a": { question_id: "w25_44_Q7a", topic: "Electromagnetic Induction", question_text: "State Lenz's law.", mark_scheme: "M1: direction of induced e.m.f. A1: opposes the change that caused it.", total_marks: 2 },
  "w25_44_Q9a": { question_id: "w25_44_Q9a", topic: "Quantum Physics", question_text: "State what is meant by the photoelectric effect.", mark_scheme: "M1: emission of electrons from metal. A1: when EM radiation is incident.", total_marks: 2 },
  "w25_44_Q10a": { question_id: "w25_44_Q10a", topic: "Astrophysics", question_text: "State what is meant by redshift.", mark_scheme: "B1: recession causes emitted light to shift. B1: increase in wavelength.", total_marks: 2 },
};

// ── Mark breakdown row ──────────────────────────────────────────────────────
function MarkRow({ mark, index }) {
  if (!mark) return null;
  const earned = mark.earned;
  return (
    <div className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border ${
      earned ? "bg-green-500/[0.07] border-green-500/20" : "bg-red-500/[0.07] border-red-500/20"
    }`}>
      <div className="shrink-0 flex flex-col items-center gap-1 mt-0.5">
        <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border leading-none ${
          earned ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/15 text-red-300 border-red-500/25"
        }`}>
          {mark.notation ?? `B${index + 1}`}
        </span>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-xs font-semibold leading-snug ${earned ? "text-green-200" : "text-red-200"}`}>
          {earned ? "✓" : "✗"} {mark.keyword ?? mark.description ?? ""}
        </p>
        {mark.feedback && (
          <p className="text-[11px] text-white/40 leading-relaxed">{mark.feedback}</p>
        )}
      </div>
    </div>
  );
}

// ── Inline note widget (matching screenshot "MY NOTE" style) ────────────────
function InlineNoteWidget({ questionId, topic, questionText }) {
  const existing = getAllNotes()[questionId];
  const [editing, setEditing] = useState(!existing?.text);
  const [text, setText] = useState(existing?.text ?? "");
  const [saved, setSaved] = useState(false);

  if (!editing && existing?.text) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-xs">✎</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p>
          </div>
          <button onClick={() => setEditing(true)} className="text-[11px] text-primary hover:brightness-110 transition-all">
            Edit
          </button>
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
          <span className="text-xs">✎</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p>
        </div>
        {existing?.text && (
          <button onClick={() => { setEditing(false); setText(existing.text); }} className="text-[11px] text-muted-foreground hover:text-foreground transition-all">
            Cancel
          </button>
        )}
      </div>
      <div className="p-3 space-y-2">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setSaved(false); }}
          placeholder="Add a note — what did you understand? What confused you?"
          rows={3}
          autoFocus={editing && !existing?.text}
          className="w-full bg-secondary/40 border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/30">Syncs across all your devices</p>
          <button
            onClick={() => {
              saveNote(questionId, text, { topic, questionText: (questionText ?? "").slice(0, 200) });
              setSaved(true);
              setEditing(false);
              setTimeout(() => setSaved(false), 2000);
            }}
            disabled={!text.trim()}
            className="text-xs font-bold text-primary hover:brightness-110 bg-primary/15 px-3 py-1.5 rounded-lg border border-primary/30 disabled:opacity-40 transition-all"
          >
            {saved ? "Saved ✓" : "Save note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Star button ──────────────────────────────────────────────────────────────
function StarButton({ questionId, topic, questionText, markScheme, feedback, answer }) {
  const [starred, setStarred] = useState(() => isStarred(questionId));

  function handleToggle() {
    const nowStarred = toggleStar(questionId, { topic, questionText, markScheme, feedback, answer });
    setStarred(nowStarred);
  }

  return (
    <button
      onClick={handleToggle}
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

// ── Deeper breakdown collapsible ─────────────────────────────────────────────
function DeeperBreakdown({ feedback, marksTotal }) {
  const [open, setOpen] = useState(false);

  // Build mark rows from flat mark_1, mark_2, ... keys
  const markRows = Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]))
    .map(([, val], i) => ({ ...val, notation: val.notation ?? `B${i + 1}` }));

  if (markRows.length === 0) return null;

  const notEarned = markRows.filter(m => !m.earned);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {open ? "Hide" : "Show"} deeper breakdown
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Mark Scheme — all marks
          </p>
          {markRows.map((m, i) => (
            <MarkRow key={i} mark={m} index={i} />
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
    feedback, answer, isQ2, isQ3, student_prediction, isReview,
    isPersistentMisunderstanding,
    topicKey, questionId, nextFullRoute, nextRetryRoute, backRoute, paperRef
  } = state || {};

  const resolvedTopicKey = topicKey ?? "gravitational_fields";
  const resolvedBack = backRoute ?? "/physics";
  const metaEntry = questionId ? QUESTION_META[questionId] : null;
  const maxMarks = metaEntry ? metaEntry.total_marks : (isQ3 ? 1 : 2);
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  const subject = detectSubject(resolvedTopicKey);
  const questionText = metaEntry?.question_text ?? "";
  const markScheme = metaEntry?.mark_scheme ?? "";
  const topic = metaEntry?.topic ?? "";

  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned, { total_marks: maxMarks, question_id: questionId });
        if (!fullMarks) {
          writeMistakeDna(feedback, questionId, metaEntry?.topic ?? resolvedTopicKey, marksEarned, maxMarks, answer ?? "").catch(() => {});
          if (questionId && QUESTION_META[questionId]) {
            addToReviewBank({
              ...QUESTION_META[questionId],
              first_attempt_score: marksEarned,
              first_attempt_feedback: feedback.cambridge_insight ?? "",
              first_attempt_answer: answer ?? "",
            });
          }
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
    const cfm = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10);
    sessionStorage.setItem("previous_score", String(marksEarned));
    if (fullMarks) {
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(cfm + 1));
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

        {/* ── P1-style header ─────────────────────────────────────────── */}
        <QuestionSessionHeader
          paperRef={paperRef ?? "9702/44"}
          subject={subject === "cs" ? "Computer Science" : "Physics"}
          currentIdx={0}
          total={1}
          allQuestions={questionId ? [{ id: questionId, topic }] : []}
          sessionAnswers={questionId ? { [questionId]: fullMarks ? "correct" : "wrong" } : {}}
          onBack={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)}
          onJumpTo={() => {}}
          showCalculator={false}
        />

        <div className="flex-1 flex flex-col gap-3 p-4 pb-8">

          {/* ── Persistent misunderstanding banner ──────────────────────── */}
          {isPersistentMisunderstanding && (
            <div className="bg-red-500/12 border border-red-500/35 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-400">⚠ Persistent Misunderstanding</p>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  You gave a very similar answer to your last attempt. Read the Cambridge insight carefully before trying again.
                </p>
              </div>
            </div>
          )}

          {/* ── Question card with annotation toolbar ────────────────────── */}
          {questionText && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              {topic && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    {topic}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">[{maxMarks} mark{maxMarks !== 1 ? "s" : ""}]</span>
                </div>
              )}
              <QuestionAnnotator text={questionText} questionId={questionId ?? "feedback"} />
            </div>
          )}

          {/* ── Student's answer ─────────────────────────────────────────── */}
          {answer && (
            <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{answer}</p>
            </div>
          )}

          {/* ── Result banner ────────────────────────────────────────────── */}
          <div className={`rounded-xl border px-4 py-3.5 flex items-center justify-between ${
            fullMarks
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fullMarks ? "✅" : "❌"}</span>
              <div>
                <p className={`text-sm font-bold ${fullMarks ? "text-green-400" : "text-red-400"}`}>
                  {fullMarks ? "Correct" : "Incorrect"}
                  {isQ3 && student_prediction ? " — Prediction attempt" : ""}
                </p>
                {!fullMarks && !isReview && (
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Added to your review bank</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xl font-black tabular-nums ${fullMarks ? "text-green-400" : "text-amber-400"}`}>
                {marksEarned}<span className="text-sm text-muted-foreground font-normal">/{maxMarks}</span>
              </p>
            </div>
          </div>

          {/* ── The Exam Takeaway ────────────────────────────────────────── */}
          {takeaway && (
            <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 overflow-hidden">
              <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/70 mb-2 flex items-center gap-2">
                <span>📌</span> The Exam Takeaway
              </p>
              <p className="text-sm font-bold text-white leading-snug relative">{takeaway}</p>
            </div>
          )}

          {/* ── Cambridge Insight ────────────────────────────────────────── */}
          {insight && (
            <div className="bg-card border border-border rounded-xl px-4 py-3.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </div>
          )}

          {/* ── My Note (inline, matching screenshot) ──────────────────── */}
          <InlineNoteWidget
            questionId={questionId ?? "unknown"}
            topic={topic}
            questionText={questionText}
          />

          {/* ── Star for teacher review ──────────────────────────────────── */}
          {questionId && (
            <StarButton
              questionId={questionId}
              topic={topic}
              questionText={questionText}
              markScheme={markScheme}
              feedback={feedback}
              answer={answer ?? ""}
            />
          )}

          {/* ── Mark scheme preview (if wrong) ──────────────────────────── */}
          {!fullMarks && markScheme && (
            <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Official Mark Scheme</p>
              <p className="text-xs text-foreground/70 leading-relaxed">{markScheme}</p>
            </div>
          )}

          {/* ── Prediction feedback (Q3) ─────────────────────────────────── */}
          {isQ3 && student_prediction && feedback.prediction_feedback && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Prediction</p>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

          {/* ── Deeper breakdown collapsible ─────────────────────────────── */}
          <DeeperBreakdown feedback={feedback} marksTotal={maxMarks} />

          {/* ── Next button ──────────────────────────────────────────────── */}
          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {buttonLabel}
          </button>

        </div>
      </div>
    </div>
  );
}