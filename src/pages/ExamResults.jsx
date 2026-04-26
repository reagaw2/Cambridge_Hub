/**
 * ExamResults — end of paper screen with AI feedback revealed.
 * Automatically adds imperfect answers to the written_review_bank.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { addToReviewBank } from "@/lib/topicStore";
import { buildExamPrompt, buildExamResponseSchema } from "@/lib/examPapers";
import { generateExamResultsPdf } from "@/lib/generatePdf";
import { useAuth } from "@/lib/AuthContext";

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function QuestionResult({ q, answer, idx, onFeedbackReady }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(answer.skipped && !answer.answer_text ? 0 : answer.score ?? null);

  useEffect(() => {
    if (!open || feedback || loading) return;
    if (!answer.answer_text) {
      // Skipped — no AI call needed
      setFeedback({ marks_earned: 0, cambridge_insight: "This question was skipped.", examiner_comment: "Try this question again in the review bank.", mark_breakdown: [] });
      setScore(0);
      onFeedbackReady(idx, 0, "Skipped — no answer provided.");
      return;
    }
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: buildExamPrompt(q, answer.answer_text),
      model: "claude_sonnet_4_6",
      response_json_schema: buildExamResponseSchema(q.total_marks),
    }).then(res => {
      const fb = res?.response ?? res;
      setFeedback(fb);
      setScore(fb.marks_earned ?? 0);
      onFeedbackReady(idx, fb.marks_earned ?? 0, fb.cambridge_insight ?? "");
      setLoading(false);
    }).catch(() => {
      setFeedback({ marks_earned: 0, cambridge_insight: "Could not retrieve feedback.", examiner_comment: "", mark_breakdown: [] });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const scoreKnown = score !== null;
  const isPerfect = scoreKnown && score >= q.total_marks;
  const isSkipped = !answer.answer_text;

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${isPerfect ? "border-green-500/30" : "border-amber-500/30"}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:brightness-105 transition-all"
      >
        <div className="flex items-center gap-3">
          {isPerfect
            ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            : <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
          }
          <div>
            <p className="text-sm font-semibold text-foreground">Q{idx + 1} · {q.topic}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isSkipped ? "Skipped" : scoreKnown ? `${score} / ${q.total_marks} marks` : `${q.total_marks} marks — tap to reveal`}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
          {/* Student's answer */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Your answer</p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {answer.answer_text || <span className="italic text-muted-foreground/50">No answer submitted</span>}
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />
              Generating feedback…
            </div>
          )}

          {feedback && (
            <>
              {/* Mark breakdown */}
              {feedback.mark_breakdown?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mark breakdown</p>
                  {feedback.mark_breakdown.map((mb, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${mb.awarded ? "bg-green-500/8 text-green-300" : "bg-red-500/8 text-red-300"}`}>
                      <span className="shrink-0">{mb.awarded ? "✓" : "✗"}</span>
                      <span className="leading-relaxed">{mb.point} — {mb.comment}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Examiner insight */}
              <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">Examiner Insight</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
              </div>

              {/* Mark scheme */}
              <div className="bg-secondary rounded-xl p-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mark scheme</p>
                <p className="text-xs text-foreground/70 leading-relaxed">{q.mark_scheme}</p>
              </div>

              {feedback.examiner_comment && (
                <p className="text-[11px] text-muted-foreground/60 italic">{feedback.examiner_comment}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { paperId, answers = [], questions = [], timeTaken = 0, paper, displayName } = location.state ?? {};

  const [scoreboard, setScoreboard] = useState({}); // { idx: score }
  const insightRef = useRef({}); // { idx: insight string }
  const loggedRef = useRef(new Set()); // track question IDs already sent to review bank
  const [pdfLoading, setPdfLoading] = useState(false);

  const totalAttempted = answers.filter(a => a.answer_text).length;
  const totalSkipped = answers.filter(a => !a.answer_text).length;
  const totalMarks = questions.reduce((s, q) => s + q.total_marks, 0);
  const totalEarned = Object.values(scoreboard).reduce((s, v) => s + (v ?? 0), 0);

  // Auto-log skipped questions to review bank immediately on mount (no card expansion needed)
  useEffect(() => {
    questions.forEach((q, i) => {
      const a = answers[i];
      if (!a?.answer_text && !loggedRef.current.has(q.id)) {
        loggedRef.current.add(q.id);
        addToReviewBank({
          question_id: q.id,
          topic: q.topic,
          question_text: q.text,
          mark_scheme: q.mark_scheme,
          total_marks: q.total_marks,
          first_attempt_score: 0,
          first_attempt_feedback: "Skipped during exam.",
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDownloadPdf() {
    setPdfLoading(true);
    await generateExamResultsPdf({
      paper,
      displayName,
      userEmail: user?.email ?? "",
      timeTaken,
      answers: answers.map((a, i) => ({ ...a, _pdf_insight: insightRef.current[i] ?? "" })),
      questions,
      scoreboard,
    });
    setPdfLoading(false);
  }

  function handleFeedbackReady(idx, score, insight) {
    insightRef.current[idx] = insight;
    setScoreboard(prev => ({ ...prev, [idx]: score }));

    // Log to review bank if not perfect — deduplicated by loggedRef
    const q = questions[idx];
    if (score < q.total_marks && !loggedRef.current.has(q.id)) {
      loggedRef.current.add(q.id);
      addToReviewBank({
        question_id: q.id,
        topic: q.topic,
        question_text: q.text,
        mark_scheme: q.mark_scheme,
        total_marks: q.total_marks,
        first_attempt_score: score,
        first_attempt_feedback: insight,
      });
    }
  }

  if (!paperId || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">No results to show.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-border/50">
          <span className="text-base font-bold tracking-wide text-foreground">Paper Complete</span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-5">

          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-lg font-serif font-semibold text-foreground">{displayName || paper}</p>
            <p className="text-xs text-muted-foreground">AI feedback is now revealed for each question.</p>
          </div>

          {/* Summary card */}
          <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total score</p>
              <p className="text-xl font-bold text-foreground">{totalEarned} <span className="text-sm text-muted-foreground">/ {totalMarks}</span></p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Time taken</p>
              <p className="text-base font-bold text-foreground">{formatTime(timeTaken)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Attempted</p>
              <p className="text-base font-bold text-foreground">{totalAttempted} <span className="text-sm text-muted-foreground">of {questions.length}</span></p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Skipped</p>
              <p className="text-base font-bold text-foreground">{totalSkipped}</p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center">
            Tap each question to reveal your score and AI feedback.
          </p>

          {/* Question breakdown */}
          <div className="space-y-3 pb-6">
            {questions.map((q, i) => (
              <QuestionResult
                key={q.id}
                q={q}
                answer={answers[i] ?? {}}
                idx={i}
                onFeedbackReady={handleFeedbackReady}
              />
            ))}
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? "Generating PDF..." : "Download Feedback Report"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all mb-6"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    </div>
  );
}