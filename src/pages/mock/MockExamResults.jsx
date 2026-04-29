/**
 * MockExamResults — self-marking results screen.
 * Student enters their score per question, sees running total.
 * Saves completed session to StudentData.exam_sessions.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MockQuestionDisplay from "@/components/mock/MockQuestionDisplay";

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

function QuestionResultCard({ question, answer, idx, score, onScoreChange }) {
  const [open, setOpen] = useState(false);
  const total = question.total_marks ?? 1;

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${
      score === null ? "border-border" : score >= total ? "border-green-500/40" : "border-amber-500/40"
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:brightness-105 transition-all"
      >
        <div className="flex items-center gap-3">
          {score !== null && score >= total
            ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
          }
          <div>
            <p className="text-sm font-semibold text-foreground">
              {question.question_number ?? `Q${idx + 1}`}
              {question.topic ? <span className="text-muted-foreground font-normal"> · {question.topic}</span> : null}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {score !== null ? `${score} / ${total} marks` : `${total} mark${total !== 1 ? "s" : ""} — tap to mark`}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-4">
          {/* Question content */}
          <MockQuestionDisplay question={question} />

          {/* Student's answer */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Your answer</p>
            <div className="bg-secondary/60 rounded-xl p-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap min-h-[48px]">
              {answer?.answer_text?.trim() || <span className="italic text-muted-foreground/40">No answer submitted</span>}
            </div>
          </div>

          {/* Mark scheme */}
          {question.mark_scheme && (
            <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">Mark Scheme</p>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{question.mark_scheme}</p>
            </div>
          )}

          {/* Self-mark input */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Enter your score</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={total}
                value={score ?? ""}
                onChange={e => {
                  const v = Math.min(total, Math.max(0, Number(e.target.value)));
                  onScoreChange(v);
                }}
                placeholder="0"
                className="w-20 bg-card border border-border rounded-lg px-3 py-2 text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="text-sm text-muted-foreground">/ {total} marks</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockExamResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { paper, answers = [], questions = [], timeTaken = 0, dateStarted } = location.state ?? {};

  const [scores, setScores] = useState(() => answers.map(() => null));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalMarks = questions.reduce((s, q) => s + (q.total_marks ?? 1), 0);
  const totalEarned = scores.reduce((s, v) => s + (v ?? 0), 0);
  const scoredCount = scores.filter(v => v !== null).length;

  async function handleSave() {
    setSaving(true);
    const user = await base44.auth.me();
    if (!user) { setSaving(false); return; }

    const records = await base44.entities.StudentData.filter({ user_email: user.email });
    const record = records[0];
    if (!record) { setSaving(false); return; }

    const sessionEntry = {
      paper_id: paper?.paper_id ?? paper?.id,
      subject: paper?.subject ?? "mock",
      date_started: dateStarted ?? new Date().toISOString(),
      status: "completed",
      time_remaining_seconds: (paper?.duration_minutes ?? 120) * 60 - timeTaken,
      current_question_index: questions.length - 1,
      answers: answers.map((a, i) => ({
        question_id: a.question_id,
        answer_text: a.answer_text,
        score: scores[i] ?? 0,
        total_marks: a.total_marks,
        skipped: !a.answer_text?.trim(),
        flagged: a.flagged,
        ai_feedback: "",
        mark_scheme: questions[i]?.mark_scheme ?? "",
      })),
      total_score: totalEarned,
      total_marks: totalMarks,
    };

    const existingSessions = record.exam_sessions ?? [];
    await base44.entities.StudentData.update(record.id, {
      exam_sessions: [...existingSessions, sessionEntry],
    });

    setSaving(false);
    setSaved(true);
  }

  if (!paper || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No results to show.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[700px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <span className="text-base font-bold text-foreground">Results</span>
          <span className="font-mono text-sm font-bold text-foreground">
            {totalEarned} <span className="text-muted-foreground font-normal text-xs">/ {totalMarks}</span>
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-5">

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-lg font-serif font-semibold text-foreground mb-1">{paper.paper_title}</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Score (so far)</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEarned} <span className="text-sm text-muted-foreground">/ {totalMarks}</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Time taken</p>
                <p className="text-xl font-bold text-foreground">{formatTime(timeTaken)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Marked</p>
                <p className="text-base font-bold text-foreground">{scoredCount} / {questions.length}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Attempted</p>
                <p className="text-base font-bold text-foreground">{answers.filter(a => a.answer_text?.trim()).length} / {questions.length}</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center">
            Expand each question, compare against the mark scheme, and enter your score.
          </p>

          {/* Per-question cards */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionResultCard
                key={q.id ?? i}
                question={q}
                answer={answers[i] ?? {}}
                idx={i}
                score={scores[i]}
                onScoreChange={v => setScores(prev => prev.map((s, j) => j === i ? v : s))}
              />
            ))}
          </div>

          {/* Save & nav */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saved ? "Session Saved ✓" : saving ? "Saving…" : "Save Results to Profile"}
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