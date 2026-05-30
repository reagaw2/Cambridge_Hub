import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllNotes } from "@/lib/questionNotesStore";
import AnswerInput from "@/components/AnswerInput";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import QuestionNoteWidget from "@/components/QuestionNoteWidget";
import QuestionSessionHeader from "@/components/QuestionSessionHeader";
import QuestionMedia from "@/components/QuestionMedia";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "@/lib/topicStore";
import DevQuestionJumper from "@/components/DevQuestionJumper";
import TeachMeHow from "@/components/TeachMeHow";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { useNodeAwareSubmit } from "@/hooks/useNodeAwareSubmit";

// Session answers are tracked in sessionStorage so they survive /feedback → back navigation
function sessionKey(topicKey) { return `q_session_answers_${topicKey}`; }
function loadSessionAnswers(topicKey) {
  try { return JSON.parse(sessionStorage.getItem(sessionKey(topicKey)) ?? "{}"); } catch { return {}; }
}
function saveSessionAnswers(topicKey, answers) {
  sessionStorage.setItem(sessionKey(topicKey), JSON.stringify(answers));
}

export default function TopicalQuestionPage({
  getNext,
  advance,
  allQuestions = [],
  backRoute = "/physics",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const topicKey = allQuestions[0]?.topic_key ?? "unknown";

  // currentBankIdx drives which question we show
  const [currentBankIdx, setCurrentBankIdx] = useState(() => getNext().idx);
  const [answer, setAnswer] = useState("");
  const [showTeachMe, setShowTeachMe] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState(() => loadSessionAnswers(topicKey));
  const [overviewOpen, setOverviewOpen] = useState(false);

  const { submit, loading, error, setError } = useNodeAwareSubmit();

  const question = allQuestions[currentBankIdx] ?? getNext().question;
  const total = allQuestions.length || getNext().total;
  const thisRoute = location.pathname;

  // Count notes for badge
  const allNotes = getAllNotes();
  const notesCount = allQuestions.filter(q => allNotes[q.id]?.text).length;

  function jumpToQuestion(idx) {
    setCurrentBankIdx(idx);
    setAnswer("");
    setShowTeachMe(false);
    setError(null);
  }

  const handleSubmit = useCallback(async () => {
    const fb = await submit(question, answer);
    if (!fb) return;

    const marksEarned = fb.marks_earned ?? 0;
    const isCorrect = marksEarned >= question.total_marks;

    // Update session answers for dots
    const updated = { ...sessionAnswers, [question.id]: isCorrect ? "correct" : "wrong" };
    setSessionAnswers(updated);
    saveSessionAnswers(topicKey, updated);

    await recordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });

    if (!isCorrect) {
      writeMistakeDna(fb, question.id, question.topic, marksEarned, question.total_marks, answer).catch(() => {});
      await addToReviewBank({
        question_id: question.id, topic: question.topic, question_text: question.text,
        mark_scheme: question.mark_scheme ?? "", total_marks: question.total_marks,
        first_attempt_score: marksEarned, first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: answer,
      });
    }

    advance();

    navigate("/feedback", {
      state: {
        feedback: fb, answer,
        topicKey: question.topic_key, questionId: question.id,
        nextFullRoute: thisRoute, nextRetryRoute: thisRoute,
        backRoute, paperRef: question.paper_ref,
      },
    });
  }, [question, answer, sessionAnswers, topicKey, submit, advance, navigate, thisRoute, backRoute]);

  const isEmpty = answer.trim().length === 0;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* ── Shared header with dots ─────────────────────────────────────── */}
        <QuestionSessionHeader
          paperRef={question.paper_ref}
          subject="Physics"
          currentIdx={currentBankIdx}
          total={total}
          allQuestions={allQuestions}
          sessionAnswers={sessionAnswers}
          onBack={() => navigate(backRoute)}
          onJumpTo={jumpToQuestion}
          notesCount={notesCount}
          onNotesToggle={() => setShowNotes(v => !v)}
          onOverview={() => setOverviewOpen(v => !v)}
        />

        {/* ── Overview panel ──────────────────────────────────────────────── */}
        {overviewOpen && (
          <div className="bg-card border-b border-border px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {Object.keys(sessionAnswers).length}/{total} answered this session
              </p>
              <button onClick={() => setOverviewOpen(false)} className="text-[11px] text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allQuestions.map((q, i) => {
                const status = sessionAnswers[q.id];
                const isCurrent = i === currentBankIdx;
                return (
                  <button key={q.id} onClick={() => { jumpToQuestion(i); setOverviewOpen(false); }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      isCurrent ? "ring-2 ring-primary border-primary bg-primary/20 text-primary"
                      : status === "correct" ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : status === "wrong" ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-secondary border-border text-muted-foreground"
                    }`}>
                    Q{i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* ── Question card with annotation toolbar ───────────────────────── */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                {question.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {question.topic}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  [{question.total_marks}m]
                </span>
              </div>
            </div>

            {/* Media (images/graphs) */}
            <QuestionMedia question={question} />

            {/* Question text with annotation toolbar */}
            <QuestionAnnotator text={question.text} questionId={question.id} />
          </div>

          {/* ── Notes (toggled via header icon) ─────────────────────────────── */}
          {showNotes && (
            <QuestionNoteWidget
              questionId={question.id}
              topic={question.topic}
              questionText={question.text}
            />
          )}

          {/* ── Answer area ─────────────────────────────────────────────────── */}
          {showTeachMe ? (
            <TeachMeHow onClose={() => setShowTeachMe(false)} />
          ) : (
            <>
              <AnswerInput value={answer} onChange={setAnswer} />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTeachMe(true)}
                  disabled={!isEmpty}
                  className="flex-1 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Teach Me How
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isEmpty || loading}
                  className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Marking…" : "Submit"}
                </button>
              </div>
              {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
            </>
          )}

          <DevQuestionJumper
            allQuestions={allQuestions}
            onJump={(q) => {
              const idx = allQuestions.findIndex(aq => aq.id === q.id);
              jumpToQuestion(idx >= 0 ? idx : 0);
              setAnswer(""); setShowTeachMe(false); setError(null);
            }}
          />
        </div>
      </div>
      {loading && <SubmittingOverlay />}
    </div>
  );
}