/**
 * MockExamSession — handles both Practice Mode and Exam Mode.
 *
 * Practice: timer pauses on exit, auto-saves every 30s, resume supported.
 * Exam:     timer runs via Date (survives tab switch), exit = submit.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flag, ChevronLeft, ChevronRight, SendHorizonal, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MockQuestionDisplay from "@/components/mock/MockQuestionDisplay";
import MockOverviewPanel from "@/components/mock/MockOverviewPanel";
import QuestionAnswerInput from "@/components/mock/QuestionAnswerInput";

function formatTime(s) {
  if (s <= 0) return "00:00:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function initAnswers(questions, resumeSession) {
  if (resumeSession?.answers?.length === questions.length) {
    return resumeSession.answers.map((a, i) => ({
      question_id: questions[i]?.question_id ?? questions[i]?.id ?? String(i),
      answer_text: a.answer_text ?? "",
      answer_data: a.answer_data ?? null,
      score: 0,
      total_marks: questions[i]?.total_marks ?? 1,
      flagged: a.flagged ?? false,
      mark_scheme: questions[i]?.mark_scheme ?? "",
    }));
  }
  return questions.map(q => ({
    question_id: q.question_id ?? q.id ?? q.question_number ?? String(Math.random()),
    answer_text: "",
    answer_data: null,
    score: 0,
    total_marks: q.total_marks ?? 1,
    flagged: false,
    mark_scheme: q.mark_scheme ?? "",
  }));
}

// Submission overlay
function SubmittingOverlay({ timeUp, error, onRetry }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-6 text-center gap-5">
      {error ? (
        <>
          <p className="text-lg font-bold text-foreground">Submission failed</p>
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={onRetry}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition-all"
          >
            Retry
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-lg font-bold text-foreground">
            {timeUp ? "Time's up! Submitting your answers…" : "Submitting your answers… please wait"}
          </p>
        </>
      )}
    </div>
  );
}

export default function MockExamSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const paper = location.state?.paper;
  const mode = location.state?.mode ?? "practice"; // "practice" | "exam"
  const resumeSession = location.state?.resumeSession ?? null;

  const questions = paper?.questions ?? [];
  const N = questions.length;
  const durationSecs = (paper?.duration_minutes > 0 ? paper.duration_minutes : 120) * 60;

  const [answers, setAnswers] = useState(() => initAnswers(questions, resumeSession));
  const [currentIdx, setCurrentIdx] = useState(resumeSession?.current_question_index ?? 0);
  const [timeLeft, setTimeLeft] = useState(
    resumeSession?.time_remaining_seconds ?? durationSecs
  );
  const [dateStarted] = useState(() => resumeSession?.date_started ?? new Date().toISOString());
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const timeRef = useRef(timeLeft);
  const startTimestampRef = useRef(
    mode === "exam" ? Date.now() - ((durationSecs - timeLeft) * 1000) : null
  );
  const hasSubmittedRef = useRef(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeRef.current = timeLeft; }, [timeLeft]);

  useEffect(() => {
    if (!paper) navigate("/mock/select");
  }, []);

  // Timer
  useEffect(() => {
    if (!paper) return;

    if (mode === "exam") {
      // Date-based timer — accurate even when tab hidden
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
        const remaining = Math.max(0, durationSecs - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          if (!hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            setTimeUp(true);
            setSubmitting(true);
            performSubmit(answersRef.current, remaining, true);
          }
        }
      }, 1000);
    } else {
      // Practice: simple interval
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exam mode: exit = submit (beforeunload + visibility)
  useEffect(() => {
    if (mode !== "exam") return;

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        clearInterval(timerRef.current);
        setSubmitting(true);
        performSubmit(answersRef.current, timeRef.current, false);
      }
    }

    function handleBeforeUnload(e) {
      if (!hasSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
        // Attempt sync save — best effort
        hasSubmittedRef.current = true;
        performSubmit(answersRef.current, timeRef.current, false);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Practice: auto-save every 30s
  useEffect(() => {
    if (mode !== "practice") return;
    const autoSave = setInterval(() => {
      savePracticeSession(answersRef.current, timeRef.current, currentIdx, false);
    }, 30000);
    return () => clearInterval(autoSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  async function getStudentRecord() {
    const user = await base44.auth.me();
    if (!user) return null;
    const records = await base44.entities.StudentData.filter({ user_email: user.email });
    if (records.length > 0) return records[0];
    return await base44.entities.StudentData.create({ user_email: user.email, exam_sessions: [] });
  }

  async function savePracticeSession(currentAnswers, remaining, idx, showToast = false) {
    const record = await getStudentRecord();
    if (!record) return;
    const sessions = (record.exam_sessions ?? []).filter(
      s => !(s.paper_id === paper.paper_id && s.status === "paused")
    );
    const entry = {
      paper_id: paper.paper_id,
      paper_title: paper.paper_title,
      subject: paper.subject ?? "mock",
      date_started: dateStarted,
      status: "paused",
      time_remaining_seconds: remaining,
      current_question_index: idx,
      answers: currentAnswers.map(a => ({
        question_id: a.question_id,
        answer_text: a.answer_text,
        answer_data: a.answer_data,
        score: 0,
        total_marks: a.total_marks,
        flagged: a.flagged,
        mark_scheme: a.mark_scheme,
      })),
      total_score: 0,
      total_marks: questions.reduce((s, q) => s + (q.total_marks ?? 1), 0),
    };
    await base44.entities.StudentData.update(record.id, { exam_sessions: [...sessions, entry] });
    if (showToast) setSavedToast(true);
  }

  const performSubmit = useCallback(async (finalAnswers, remaining, isTimeUp) => {
    setSubmitError(null);
    try {
      const record = await getStudentRecord();
      if (!record) throw new Error("Could not load student record.");

      const sessions = (record.exam_sessions ?? []).filter(
        s => !(s.paper_id === paper.paper_id && (s.status === "paused" || s.status === "submitted"))
      );
      const entry = {
        paper_id: paper.paper_id,
        paper_title: paper.paper_title,
        subject: paper.subject ?? "mock",
        date_started: dateStarted,
        status: "submitted",
        time_remaining_seconds: remaining,
        current_question_index: questions.length - 1,
        answers: finalAnswers.map(a => ({
          question_id: a.question_id,
          answer_text: a.answer_text,
          answer_data: a.answer_data,
          score: 0,
          total_marks: a.total_marks,
          flagged: a.flagged,
          mark_scheme: a.mark_scheme,
        })),
        total_score: 0,
        total_marks: questions.reduce((s, q) => s + (q.total_marks ?? 1), 0),
        date_submitted: new Date().toISOString(),
      };

      await base44.entities.StudentData.update(record.id, { exam_sessions: [...sessions, entry] });

      clearInterval(timerRef.current);
      const timeTaken = durationSecs - remaining;
      navigate("/mock/results", {
        state: { paper, answers: finalAnswers, questions, timeTaken, dateStarted, mode },
      });
    } catch (err) {
      setSubmitError(err.message ?? "Save failed. Please retry.");
      hasSubmittedRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    clearInterval(timerRef.current);
    setSubmitting(true);
    setSubmitConfirm(false);
    performSubmit(answersRef.current, timeRef.current, false);
  }

  function handleRetrySubmit() {
    hasSubmittedRef.current = true;
    setSubmitError(null);
    performSubmit(answersRef.current, timeRef.current, timeUp);
  }

  async function handleExitPractice() {
    clearInterval(timerRef.current);
    await savePracticeSession(answersRef.current, timeRef.current, currentIdx, false);
    navigate("/mock/select", { state: { savedMessage: "Progress saved. You can resume from the paper selection screen." } });
  }

  function updateAnswer(field, value) {
    setAnswers(prev => {
      const next = prev.map((a, i) => i === currentIdx ? { ...a, [field]: value } : a);
      answersRef.current = next;
      return next;
    });
  }

  if (!paper || N === 0) return null;

  const currentAnswer = answers[currentIdx] ?? {};
  const timerRed = timeLeft < 600;
  const timerPulse = timeLeft < 300;
  const progress = answers.filter(a => a.answer_text?.trim() || a.answer_data).length / N;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === N - 1;
  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[700px] flex flex-col min-h-screen">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[140px]">{paper.paper_title}</span>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold tabular-nums transition-colors ${
                timerPulse ? "text-red-400 animate-pulse" : timerRed ? "text-red-400" : "text-foreground"
              }`}>⏱ {formatTime(timeLeft)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                mode === "exam" ? "bg-amber-500/20 text-amber-400" : "bg-primary/15 text-primary"
              }`}>{mode === "exam" ? "EXAM" : "PRACTICE"}</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{currentIdx + 1} / {N}</span>
          </div>
          <div className="w-full h-0.5 bg-secondary">
            <div className="h-0.5 bg-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">

          <MockOverviewPanel questions={questions} answers={answers} currentIdx={currentIdx} onJump={setCurrentIdx} />

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{q?.topic ?? ""}</span>
              <span className="font-mono text-xs text-muted-foreground">[{q?.total_marks ?? 1} mark{q?.total_marks !== 1 ? "s" : ""}]</span>
            </div>
            <MockQuestionDisplay question={q} />
          </div>

          {/* Answer input — type-aware */}
          <QuestionAnswerInput
            question={q}
            value={
              (q?.question_type === "table_fill" || q?.question_type === "matching" || q?.question_type === "drawing")
                ? currentAnswer.answer_data
                : currentAnswer.answer_text
            }
            onChange={val => {
              if (q?.question_type === "table_fill" || q?.question_type === "matching" || q?.question_type === "drawing") {
                updateAnswer("answer_data", val);
              } else {
                updateAnswer("answer_text", typeof val === "string" ? val : JSON.stringify(val));
              }
            }}
          />

          {/* Flag toggle */}
          <button
            onClick={() => updateAnswer("flagged", !currentAnswer.flagged)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all w-fit ${
              currentAnswer.flagged
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "bg-card border-border text-muted-foreground hover:brightness-110"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            {currentAnswer.flagged ? "Flagged for review" : "Flag for review"}
          </button>

          {/* Navigation */}
          <div className="grid grid-cols-3 gap-2 pb-2">
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={isFirst}
              className="flex items-center justify-center gap-1 border border-border rounded-xl py-3 text-sm font-semibold text-muted-foreground hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {isLast ? (
              <button
                onClick={() => setSubmitConfirm(true)}
                className="col-span-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <SendHorizonal className="w-4 h-4" /> Submit
              </button>
            ) : (
              <>
                <div />
                <button
                  onClick={() => setCurrentIdx(i => Math.min(N - 1, i + 1))}
                  className="flex items-center justify-center gap-1 border border-border rounded-xl py-3 text-sm font-semibold text-muted-foreground hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Bottom action buttons */}
          <div className="grid grid-cols-2 gap-2 pb-4">
            {!isLast && (
              <button
                onClick={() => setSubmitConfirm(true)}
                className="flex items-center justify-center gap-2 border border-primary/40 text-primary text-sm font-semibold py-3 rounded-xl hover:bg-primary/10 transition-all"
              >
                <SendHorizonal className="w-4 h-4" /> Submit Early
              </button>
            )}
            {mode === "practice" && (
              <button
                onClick={handleExitPractice}
                className="flex items-center justify-center gap-2 border border-border text-muted-foreground text-sm font-semibold py-3 rounded-xl hover:brightness-110 transition-all"
              >
                <LogOut className="w-4 h-4" /> Save &amp; Exit
              </button>
            )}
          </div>
        </div>

        {/* Submit confirmation modal */}
        {submitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 w-full max-w-sm">
              <p className="font-bold text-foreground text-base">Submit exam?</p>
              <p className="text-sm text-muted-foreground">
                {answers.filter(a => !a.answer_text?.trim() && !a.answer_data).length} question{answers.filter(a => !a.answer_text?.trim() && !a.answer_data).length !== 1 ? "s" : ""} unanswered.
                You'll self-mark at the end.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSubmitConfirm(false)} className="border border-border text-muted-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm">Go back</button>
                <button onClick={handleSubmit} className="bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm">Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Saved toast */}
        {savedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground text-sm font-semibold px-5 py-3 rounded-xl shadow-lg" onAnimationEnd={() => setSavedToast(false)}>
            Progress saved ✓
          </div>
        )}

        {/* Submitting overlay */}
        {submitting && (
          <SubmittingOverlay timeUp={timeUp} error={submitError} onRetry={handleRetrySubmit} />
        )}
      </div>
    </div>
  );
}