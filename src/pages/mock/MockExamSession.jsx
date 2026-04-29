/**
 * MockExamSession — full timed exam from ExamPaper entity data.
 * Countdown timer, per-question answers, flag toggle, prev/next nav, overview panel.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flag, LogOut, ChevronLeft, ChevronRight, SendHorizonal } from "lucide-react";
import MockQuestionDisplay from "@/components/mock/MockQuestionDisplay";
import MockOverviewPanel from "@/components/mock/MockOverviewPanel";

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function initAnswers(questions) {
  return questions.map(q => ({
    question_id: q.id ?? q.question_number ?? String(Math.random()),
    answer_text: "",
    score: 0,
    total_marks: q.total_marks ?? 1,
    flagged: false,
    mark_scheme: q.mark_scheme ?? "",
  }));
}

export default function MockExamSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const paper = location.state?.paper;

  const questions = paper?.questions ?? [];
  const N = questions.length;
  const durationSecs = (paper?.duration_minutes ?? 120) * 60;

  const [answers, setAnswers] = useState(() => initAnswers(questions));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSecs);
  const [dateStarted] = useState(() => new Date().toISOString());
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const timeRef = useRef(timeLeft);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeRef.current = timeLeft; }, [timeLeft]);

  // Redirect if no paper passed
  useEffect(() => {
    if (!paper) navigate("/mock/select");
  }, []);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentAnswer = answers[currentIdx] ?? {};

  function updateAnswer(field, value) {
    setAnswers(prev => prev.map((a, i) => i === currentIdx ? { ...a, [field]: value } : a));
  }

  const handleSubmit = useCallback((timeUp = false) => {
    clearInterval(timerRef.current);
    const timeTaken = durationSecs - timeRef.current;
    navigate("/mock/results", {
      state: {
        paper,
        answers: answersRef.current,
        questions,
        timeTaken,
        dateStarted,
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!paper || N === 0) return null;

  const timerRed = timeLeft < 600;
  const timerPulse = timeLeft < 300;
  const progress = answers.filter(a => a.answer_text?.trim()).length / N;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === N - 1;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[700px] flex flex-col min-h-screen">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[140px]">{paper.paper_title}</span>
            <span className={`font-mono text-sm font-bold tabular-nums transition-colors
              ${timerPulse ? "text-red-400 animate-pulse" : timerRed ? "text-red-400" : "text-foreground"}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {currentIdx + 1} / {N}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-0.5 bg-secondary">
            <div className="h-0.5 bg-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pt-4 overflow-y-auto">

          {/* Overview panel */}
          <MockOverviewPanel
            questions={questions}
            answers={answers}
            currentIdx={currentIdx}
            onJump={setCurrentIdx}
          />

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {questions[currentIdx]?.topic ?? ""}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                [{questions[currentIdx]?.total_marks ?? 1} mark{questions[currentIdx]?.total_marks !== 1 ? "s" : ""}]
              </span>
            </div>
            <MockQuestionDisplay question={questions[currentIdx]} />
          </div>

          {/* Answer area */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={currentAnswer.answer_text}
                onChange={e => updateAnswer("answer_text", e.target.value)}
                placeholder="Write your answer here…"
                rows={6}
                maxLength={1200}
                className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
              <span className="absolute bottom-3 right-4 font-mono text-[10px] text-muted-foreground/40">
                {currentAnswer.answer_text?.length ?? 0}/1200
              </span>
            </div>

            {/* Flag toggle */}
            <button
              onClick={() => updateAnswer("flagged", !currentAnswer.flagged)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                currentAnswer.flagged
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-card border-border text-muted-foreground hover:brightness-110"
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {currentAnswer.flagged ? "Flagged for review" : "Flag for review"}
            </button>
          </div>

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
                <SendHorizonal className="w-4 h-4" /> Submit Exam
              </button>
            ) : (
              <>
                <div /> {/* spacer */}
                <button
                  onClick={() => setCurrentIdx(i => Math.min(N - 1, i + 1))}
                  className="flex items-center justify-center gap-1 border border-border rounded-xl py-3 text-sm font-semibold text-muted-foreground hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Submit from any question */}
          {!isLast && (
            <button
              onClick={() => setSubmitConfirm(true)}
              className="w-full flex items-center justify-center gap-2 border border-primary/40 text-primary text-sm font-semibold py-3 rounded-xl hover:bg-primary/10 transition-all"
            >
              <SendHorizonal className="w-4 h-4" /> Submit Exam Early
            </button>
          )}

        </div>

        {/* Submit confirmation modal */}
        {submitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 w-full max-w-sm">
              <p className="font-bold text-foreground text-base">Submit exam?</p>
              <p className="text-sm text-muted-foreground">
                {answers.filter(a => !a.answer_text?.trim()).length} question{answers.filter(a => !a.answer_text?.trim()).length !== 1 ? "s" : ""} left unanswered.
                You'll see all answers and mark yourself.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSubmitConfirm(false)}
                  className="border border-border text-muted-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
                >
                  Go back
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  className="bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}