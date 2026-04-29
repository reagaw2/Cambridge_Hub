/**
 * ExamSession — the timed exam interface.
 * No AI feedback shown here. Timer counts down. Save & Exit pauses.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flag, LogOut } from "lucide-react";
import { getPaper } from "@/lib/examPapers";
import { getCSPaper } from "@/lib/csPapers";
import { getPausedSession, startExamSession, saveExamSession, completeExamSession, invalidateExamCache } from "@/lib/examStore";
import { recordGlobalQuestionAnswered } from "@/lib/topicStore";
import VoiceInput from "@/components/VoiceInput";
import QuestionMedia from "@/components/QuestionMedia";

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, "0")).join(":");
}

export default function ExamSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { paperId, fresh } = location.state ?? {};

  const paper = getPaper(paperId) ?? getCSPaper(paperId);
  const questions = paper?.questions ?? [];
  const N = questions.length;

  // Session state
  const [answers, setAnswers] = useState(() =>
    questions.map(q => ({ question_id: q.id, answer_text: "", score: 0, total_marks: q.total_marks, skipped: false, flagged: false, ai_feedback: "", mark_scheme: q.mark_scheme }))
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const totalMarks = questions.reduce((s, q) => s + q.total_marks, 0);
  const secsPerMark = paper?.secondsPerMark ?? 105;
  const timeAllocated = totalMarks * secsPerMark;
  const [timeLeft, setTimeLeft] = useState(timeAllocated);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [phase, setPhase] = useState("exam"); // "exam" | "flagged" | "done"
  const [flaggedQueue, setFlaggedQueue] = useState([]); // indices of flagged questions yet to answer
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const timeRef = useRef(timeLeft);
  const currentIdxRef = useRef(currentIdx);
  const currentAnswerRef = useRef("");

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { currentAnswerRef.current = currentAnswer; }, [currentAnswer]);

  // Load session on mount
  useEffect(() => {
    if (!paper) { navigate("/exam/select"); return; }
    async function init() {
      invalidateExamCache();
      if (fresh) {
        const s = await startExamSession(paperId, paper.subject, N, totalMarks);
        if (s) {
          setAnswers(questions.map(q => ({ question_id: q.id, answer_text: "", score: 0, total_marks: q.total_marks, skipped: false, flagged: false, ai_feedback: "", mark_scheme: q.mark_scheme })));
          setCurrentIdx(0);
          setTimeLeft(totalMarks * 105);
        }
      } else {
        const s = await getPausedSession(paperId);
        if (s) {
          setAnswers(s.answers.map((a, i) => ({
            ...a,
            total_marks: questions[i]?.total_marks ?? a.total_marks,
            mark_scheme: questions[i]?.mark_scheme ?? a.mark_scheme,
          })));
          setCurrentIdx(s.current_question_index ?? 0);
          setTimeLeft(s.time_remaining_seconds ?? timeAllocated);
        }
      }
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync current answer box when index changes
  useEffect(() => {
    if (!loading) {
      setCurrentAnswer(answers[currentIdx]?.answer_text ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, loading]);

  // Start timer
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Save & pause on unmount / page leave
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      persistSession(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistSession() {
    const updatedAnswers = [...answersRef.current];
    const cur = currentIdxRef.current;
    const liveAnswer = currentAnswerRef.current;
    if (updatedAnswers[cur] && liveAnswer) {
      updatedAnswers[cur] = { ...updatedAnswers[cur], answer_text: liveAnswer };
    }
    saveExamSession(paperId, {
      time_remaining_seconds: timeRef.current,
      current_question_index: cur,
      answers: updatedAnswers,
    });
  }

  function handleTimeUp() {
    // Auto-submit current answer, mark all unanswered as skipped
    const updated = answersRef.current.map((a, i) => {
      if (i === currentIdxRef.current) return { ...a, answer_text: currentAnswer || a.answer_text };
      if (!a.answer_text && !a.skipped) return { ...a, skipped: true, flagged: false };
      return a;
    });
    setAnswers(updated);
    answersRef.current = updated;
    finishExam(updated);
  }

  function commitCurrentAnswer(updated, idx) {
    const text = currentAnswer.trim();
    const newAnswers = [...updated];
    newAnswers[idx] = { ...newAnswers[idx], answer_text: text };
    return newAnswers;
  }

  function advanceToNext(updatedAnswers, fromIdx) {
    // Find next unskipped/unflagged unanswered question
    for (let i = fromIdx + 1; i < N; i++) {
      if (!updatedAnswers[i].skipped && !updatedAnswers[i].flagged && !updatedAnswers[i].answer_text) {
        return i;
      }
    }
    // All main questions done — go to flagged phase
    const flagged = updatedAnswers
      .map((a, i) => ({ ...a, _idx: i }))
      .filter(a => a.flagged && !a.answer_text);
    if (flagged.length > 0) {
      setPhase("flagged");
      setFlaggedQueue(flagged.map(a => a._idx));
      return flagged[0]._idx;
    }
    // Done
    finishExam(updatedAnswers);
    return fromIdx;
  }

  function handleSubmitAndContinue() {
    if (!currentAnswer.trim()) return;
    let updated = commitCurrentAnswer(answers, currentIdx);
    updated[currentIdx] = { ...updated[currentIdx], flagged: false, skipped: false };
    setAnswers(updated);
    answersRef.current = updated;
    setCurrentAnswer("");
    // Count toward daily streak (fire-and-forget)
    recordGlobalQuestionAnswered();

    if (phase === "flagged") {
      const remaining = flaggedQueue.filter(i => i !== currentIdx);
      if (remaining.length === 0) {
        finishExam(updated);
        return;
      }
      setFlaggedQueue(remaining);
      setCurrentIdx(remaining[0]);
      return;
    }

    const next = advanceToNext(updated, currentIdx);
    setCurrentIdx(next);
  }

  function handleSkip() {
    let updated = [...answers];
    updated[currentIdx] = { ...updated[currentIdx], flagged: true, answer_text: currentAnswer };
    setAnswers(updated);
    answersRef.current = updated;
    setCurrentAnswer("");

    if (phase === "flagged") {
      // Move to end of flagged queue
      const remaining = flaggedQueue.filter(i => i !== currentIdx);
      if (remaining.length === 0) {
        finishExam(updated);
        return;
      }
      setFlaggedQueue([...remaining, currentIdx]); // put at back
      setCurrentIdx(remaining[0]);
      return;
    }

    const next = advanceToNext(updated, currentIdx);
    setCurrentIdx(next);
  }

  function handleSaveAndExit() {
    clearInterval(timerRef.current);
    setSaving(true);
    // Save current answer text
    const updated = [...answers];
    if (currentAnswer.trim()) {
      updated[currentIdx] = { ...updated[currentIdx], answer_text: currentAnswer };
    }
    setAnswers(updated);
    answersRef.current = updated;
    saveExamSession(paperId, {
      time_remaining_seconds: timeRef.current,
      current_question_index: currentIdx,
      answers: updated,
    }).then(() => {
      invalidateExamCache();
      navigate("/", { state: { pausedExam: { paperId, paper: paper.id, displayName: paper.displayName, timeLeft: timeRef.current, questionIndex: currentIdx, total: N } } });
    });
  }

  function finishExam(finalAnswers) {
    clearInterval(timerRef.current);
    const timeTaken = timeAllocated - timeRef.current;
    completeExamSession(paperId, {
      answers: finalAnswers,
      time_remaining_seconds: timeRef.current,
      current_question_index: N - 1,
    }).then(() => {
      invalidateExamCache();
      navigate("/exam/results", {
        state: {
          paperId,
          answers: finalAnswers,
          questions,
          timeTaken,
          paper: paper.id,
          displayName: paper.displayName,
        }
      });
    });
  }

  if (loading || !paper) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const q = questions[currentIdx];
  const answeredCount = answers.filter(a => a.answer_text && !a.flagged).length;
  const progress = answeredCount / N;

  const timerRed = timeLeft < 600;
  const timerPulse = timeLeft < 300;

  const flaggedRemaining = answers.filter(a => a.flagged && !a.answer_text).length;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar — always visible */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-card/80 sticky top-0 z-10">
          <span className="text-xs font-mono text-muted-foreground">{paper.displayName}</span>
          <span className={`font-mono text-sm font-bold tabular-nums transition-colors
            ${timerPulse ? "text-red-400 animate-pulse" : timerRed ? "text-red-400" : "text-foreground"}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
          <span className="text-xs font-mono text-muted-foreground">Q{currentIdx + 1} / {N}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary">
          <div className="h-1 bg-primary transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Question pills */}
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none border-b border-border/30">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${i === currentIdx
                  ? "ring-2 ring-primary scale-110"
                  : a.answer_text && !a.flagged
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : a.flagged
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-secondary text-muted-foreground border border-border"
                }`}
            >
              {a.flagged ? "🚩" : i + 1}
            </div>
          ))}
        </div>

        {/* Flagged phase banner */}
        {phase === "flagged" && (
          <div className="mx-4 mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
            <p className="text-xs text-amber-400 font-semibold">
              {flaggedRemaining} flagged question{flaggedRemaining !== 1 ? "s" : ""} remaining — let's go back to them.
            </p>
          </div>
        )}

        {/* Question area */}
        <div className="flex-1 flex flex-col gap-4 p-4 pt-3 overflow-y-auto">

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                Q{currentIdx + 1}
              </span>
              <span className="font-mono text-xs text-muted-foreground">[{q.total_marks} mark{q.total_marks !== 1 ? "s" : ""}]</span>
            </div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {q.topic}
            </span>
            <QuestionMedia question={q} />
            <p className="text-[15px] leading-relaxed text-foreground/90">{q.text}</p>
          </div>

          {/* Answer input */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Write your answer here — use Cambridge language"
                rows={5}
                maxLength={800}
                className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              <span className="absolute bottom-3 right-4 font-mono text-[11px] text-muted-foreground/50">
                {currentAnswer.length}/800
              </span>
            </div>
            <VoiceInput onTranscript={setCurrentAnswer} />
          </div>

          {/* Bottom buttons */}
          <div className="grid grid-cols-3 gap-2 pb-4">
            <button
              onClick={handleSaveAndExit}
              disabled={saving}
              className="flex flex-col items-center gap-1 border border-border rounded-xl py-3 text-xs font-semibold text-muted-foreground hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-4 h-4" />
              Save & Exit
            </button>

            <button
              onClick={handleSkip}
              className="flex flex-col items-center gap-1 border border-amber-500/40 bg-amber-500/10 rounded-xl py-3 text-xs font-semibold text-amber-400 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Flag className="w-4 h-4" />
              🚩 Skip
            </button>

            <button
              onClick={handleSubmitAndContinue}
              disabled={!currentAnswer.trim()}
              className="flex flex-col items-center gap-1 bg-primary text-primary-foreground rounded-xl py-3 text-xs font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit &
              Continue →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}