import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Star, AlertTriangle } from "lucide-react";
import { getAllNotes } from "@/lib/questionNotesStore";
import { saveNote } from "@/lib/questionNotesStore";
import { isStarred, toggleStar } from "@/lib/writtenStarStore";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import QuestionSessionHeader from "@/components/QuestionSessionHeader";

// ── Inline note widget ──────────────────────────────────────────────────────
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
          <span className="text-xs">✎</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Note</p>
        </div>
        {existing?.text && (
          <button onClick={() => { setEditing(false); setText(existing.text); }} className="text-[11px] text-muted-foreground hover:text-foreground">Cancel</button>
        )}
      </div>
      <div className="p-3 space-y-2">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setSaved(false); }}
          placeholder="Add a note — what did you learn from this question?"
          rows={3}
          className="w-full bg-secondary/40 border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/30">Syncs across your devices</p>
          <button
            onClick={() => {
              saveNote(questionId, text, { topic, questionText: (questionText ?? "").slice(0, 200) });
              setSaved(true);
              setEditing(false);
              setTimeout(() => setSaved(false), 2000);
            }}
            disabled={!text.trim()}
            className="text-xs font-bold text-blue-400 hover:brightness-110 bg-blue-500/15 px-3 py-1.5 rounded-lg border border-blue-500/30 disabled:opacity-40 transition-all"
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
  const [starred, setStarred] = useState(() => isStarred(questionId ?? ""));

  function handleToggle() {
    if (!questionId) return;
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

// ── Deeper breakdown ──────────────────────────────────────────────────────────
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mark Scheme — all marks</p>
          {markRows.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border ${
              m.earned ? "bg-green-500/[0.07] border-green-500/20" : "bg-red-500/[0.07] border-red-500/20"
            }`}>
              <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border leading-none shrink-0 mt-0.5 ${
                m.earned ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/15 text-red-300 border-red-500/25"
              }`}>
                {m.notation}
              </span>
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

export default function CSFeedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback,
    answer,
    totalMarks,
    backRoute,
    dashRoute,
    paperRef,
    isReview,
    topicRoute,
    topicLabel,
    isLastQuestion,
    questionId,
    topicKey,
  } = state || {};

  if (!feedback) { navigate("/cs"); return null; }

  const marksEarned = feedback.marks_earned ?? 0;
  const maxMarks = totalMarks ?? 1;
  const fullMarks = marksEarned >= maxMarks;
  const takeaway = feedback.pulse_layer_1 ?? feedback.cambridge_insight ?? null;
  const insight = feedback.cambridge_insight ?? null;
  const questionText = feedback.question_text ?? "";
  const topic = topicLabel ?? topicKey ?? "";

  function handlePrimary() {
    if (isReview) {
      navigate(fullMarks ? "/cs/review-bank" : backRoute ?? "/cs/review-session");
    } else {
      if (fullMarks && isLastQuestion) {
        navigate("/cs/end-of-bank", { state: { topicLabel, topicRoute: backRoute } });
      } else if (fullMarks && topicRoute) {
        navigate(topicRoute);
      } else {
        navigate(backRoute ?? "/cs");
      }
    }
  }

  const primaryLabel = isReview
    ? (fullMarks ? "Back to review bank →" : "Try again")
    : (fullMarks ? "Next question →" : "Try again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* ── P1-style header ─────────────────────────────────────────── */}
        <QuestionSessionHeader
          paperRef={paperRef ?? "9618"}
          subject="Computer Science"
          currentIdx={0}
          total={1}
          allQuestions={questionId ? [{ id: questionId, topic }] : []}
          sessionAnswers={questionId ? { [questionId]: fullMarks ? "correct" : "wrong" } : {}}
          onBack={() => navigate(dashRoute ?? "/cs")}
          onJumpTo={() => {}}
          showCalculator={false}
        />

        <div className="flex-1 flex flex-col gap-3 p-4 pb-8">

          {/* ── Question text with annotation ──────────────────────────── */}
          {questionText && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              {topic && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{topic}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">[{maxMarks}m]</span>
                </div>
              )}
              <QuestionAnnotator text={questionText} questionId={questionId ?? "cs-feedback"} />
            </div>
          )}

          {/* ── Student answer ─────────────────────────────────────────── */}
          {answer && (
            <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{answer}</p>
            </div>
          )}

          {/* ── Result banner ─────────────────────────────────────────── */}
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

          {/* ── Exam Takeaway ──────────────────────────────────────────── */}
          {takeaway && (
            <div className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-5 overflow-hidden">
              <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-violet-400/10 blur-xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-400/70 mb-2 flex items-center gap-2">
                <span>📌</span> The Exam Takeaway
              </p>
              <p className="text-sm font-bold text-white leading-snug relative">{takeaway}</p>
            </div>
          )}

          {/* ── Cambridge Insight ─────────────────────────────────────── */}
          {insight && insight !== takeaway && (
            <div className="bg-card border border-border rounded-xl px-4 py-3.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cambridge Insight</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </div>
          )}

          {/* ── My Note ───────────────────────────────────────────────── */}
          <InlineNoteWidget
            questionId={questionId ?? "cs-unknown"}
            topic={topic}
            questionText={questionText}
          />

          {/* ── Star for teacher review ───────────────────────────────── */}
          <StarButton
            questionId={questionId}
            topic={topic}
            questionText={questionText}
            markScheme=""
            feedback={feedback}
            answer={answer ?? ""}
          />

          {/* ── Deeper breakdown ──────────────────────────────────────── */}
          <DeeperBreakdown feedback={feedback} />

          {/* ── Primary action ────────────────────────────────────────── */}
          <button
            onClick={handlePrimary}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all mt-1"
          >
            {primaryLabel}
          </button>

          {/* ── Secondary nav ─────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-6">
            {isReview && (
              <button onClick={() => navigate("/cs/review-bank")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Review bank
              </button>
            )}
            <button onClick={() => navigate("/cs")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              CS dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}