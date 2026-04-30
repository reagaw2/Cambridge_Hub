/**
 * MockExamResults — self-marking results with PDF download.
 */
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Save, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MockQuestionDisplay from "@/components/mock/MockQuestionDisplay";

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

function renderAnswerForDisplay(answer, question) {
  const type = question?.question_type ?? "written";

  if (type === "table_fill" && Array.isArray(answer?.answer_data)) {
    const { table_data } = question;
    const headers = table_data?.headers ?? [];
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
          {headers.length > 0 && (
            <thead>
              <tr>{headers.map((h, i) => <th key={i} style={{ border: "1px solid #555", padding: "4px 10px", fontWeight: 600 }}>{h}</th>)}</tr>
            </thead>
          )}
          <tbody>
            {answer.answer_data.map((row, ri) => (
              <tr key={ri}>{row.map((cell, ci) => <td key={ci} style={{ border: "1px solid #555", padding: "4px 10px", textAlign: "center" }}>{String(cell)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "matching" && Array.isArray(answer?.answer_data)) {
    const { matching_data } = question ?? {};
    return (
      <div className="space-y-1">
        {answer.answer_data.map(([l, r], i) => (
          <p key={i} className="text-xs text-foreground/80">{matching_data?.from_items?.[l] ?? l} → {matching_data?.to_items?.[r] ?? r}</p>
        ))}
      </div>
    );
  }

  if (type === "drawing" && answer?.answer_data?.imageData) {
    return <img src={answer.answer_data.imageData} alt="Drawing answer" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #555" }} />;
  }

  return (
    <div className="bg-secondary/60 rounded-xl p-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap min-h-[48px]">
      {answer?.answer_text?.trim() || <span className="italic text-muted-foreground/40">No answer submitted</span>}
    </div>
  );
}

function QuestionResultCard({ question, answer, idx, score, needsReview, onScoreChange, onReviewChange }) {
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
            : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
          <div>
            <p className="text-sm font-semibold text-foreground">
              {question.question_number ?? `Q${idx + 1}`}
              {question.topic ? <span className="text-muted-foreground font-normal"> · {question.topic}</span> : null}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {score !== null ? `${score} / ${total} marks` : `${total} mark${total !== 1 ? "s" : ""} — tap to mark`}
              {needsReview && <span className="ml-2 text-amber-400">🚩 Review</span>}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-4">
          <MockQuestionDisplay question={question} />

          {/* Student's answer */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Your answer</p>
            {renderAnswerForDisplay(answer, question)}
          </div>

          {/* Mark scheme */}
          {question.mark_scheme && (
            <div className="bg-green-500/8 border border-green-500/25 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-green-400/70">Mark Scheme</p>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{question.mark_scheme}</p>
            </div>
          )}

          {/* Self-mark input */}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your score</p>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`review-${idx}`}
                checked={!!needsReview}
                onChange={e => onReviewChange(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor={`review-${idx}`} className="text-xs text-muted-foreground cursor-pointer">Needs review</label>
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
  const { paper, answers = [], questions = [], timeTaken = 0, dateStarted, mode } = location.state ?? {};

  const [scores, setScores] = useState(() => answers.map(() => null));
  const [needsReview, setNeedsReview] = useState(() => answers.map(() => false));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const totalMarks = questions.reduce((s, q) => s + (q.total_marks ?? 1), 0);
  const totalEarned = scores.reduce((s, v) => s + (v ?? 0), 0);
  const scoredCount = scores.filter(v => v !== null).length;
  const pct = totalMarks > 0 ? Math.round((totalEarned / totalMarks) * 100) : 0;
  const flaggedCount = needsReview.filter(Boolean).length;

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const user = await base44.auth.me();
    if (!user) { setSaving(false); setSaveError("Not logged in."); return; }
    const records = await base44.entities.StudentData.filter({ user_email: user.email });
    const record = records[0];
    if (!record) { setSaving(false); setSaveError("No student record found."); return; }

    const sessions = (record.exam_sessions ?? []).filter(
      s => !(s.paper_id === paper?.paper_id && s.status === "submitted")
    );
    const entry = {
      paper_id: paper?.paper_id ?? paper?.id,
      paper_title: paper?.paper_title,
      subject: paper?.subject ?? "mock",
      date_started: dateStarted ?? new Date().toISOString(),
      date_submitted: new Date().toISOString(),
      status: "completed",
      mode: mode ?? "practice",
      time_remaining_seconds: (paper?.duration_minutes ?? 120) * 60 - timeTaken,
      current_question_index: questions.length - 1,
      answers: answers.map((a, i) => ({
        question_id: a.question_id,
        answer_text: a.answer_text,
        score: scores[i] ?? 0,
        total_marks: a.total_marks,
        skipped: !a.answer_text?.trim() && !a.answer_data,
        flagged: needsReview[i],
        mark_scheme: questions[i]?.mark_scheme ?? "",
      })),
      total_score: totalEarned,
      total_marks: totalMarks,
    };

    await base44.entities.StudentData.update(record.id, { exam_sessions: [...sessions, entry] });
    setSaving(false);
    setSaved(true);
  }

  async function handleDownloadPdf() {
    setPdfLoading(true);
    const user = await base44.auth.me();
    const studentName = user?.full_name ?? user?.email ?? "Student";
    const dateStr = new Date().toLocaleDateString();
    const paperId = paper?.paper_id ?? "paper";

    // Load jsPDF from CDN
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    function checkPage(needed = 10) {
      if (y + needed > 275) { doc.addPage(); y = 20; }
    }

    // Header
    doc.setFontSize(16); doc.setFont(undefined, "bold");
    doc.text(paper?.paper_title ?? "Exam Results", margin, y); y += 8;
    doc.setFontSize(10); doc.setFont(undefined, "normal");
    doc.text(`Student: ${studentName}   Date: ${dateStr}`, margin, y); y += 6;
    doc.text(`Score: ${totalEarned} / ${totalMarks} (${pct}%)   Time taken: ${formatTime(timeTaken)}`, margin, y); y += 10;
    doc.line(margin, y, pageW - margin, y); y += 6;

    // Per-question
    questions.forEach((q, i) => {
      checkPage(20);
      doc.setFontSize(11); doc.setFont(undefined, "bold");
      doc.text(`${q.question_number ?? `Q${i + 1}`}${q.topic ? ` · ${q.topic}` : ""}`, margin, y); y += 6;
      doc.setFont(undefined, "normal"); doc.setFontSize(9);

      const qLines = doc.splitTextToSize(q.question_text ?? "", pageW - margin * 2);
      checkPage(qLines.length * 4 + 4);
      doc.text(qLines, margin, y); y += qLines.length * 4 + 2;

      const ansText = answers[i]?.answer_text?.trim() || "(No answer)";
      const ansLines = doc.splitTextToSize(`Your answer: ${ansText}`, pageW - margin * 2);
      checkPage(ansLines.length * 4 + 4);
      doc.text(ansLines, margin, y); y += ansLines.length * 4 + 2;

      doc.setTextColor(34, 139, 34);
      const msLines = doc.splitTextToSize(`Mark scheme: ${q.mark_scheme ?? ""}`, pageW - margin * 2);
      checkPage(msLines.length * 4 + 4);
      doc.text(msLines, margin, y); y += msLines.length * 4 + 2;
      doc.setTextColor(0, 0, 0);

      doc.text(`Score: ${scores[i] ?? 0} / ${q.total_marks ?? 1}${needsReview[i] ? "  🚩 Flagged for review" : ""}`, margin, y); y += 8;
      checkPage(2);
      doc.line(margin, y, pageW - margin, y); y += 6;
    });

    const filename = `${paperId}_results_${dateStr.replace(/\//g, "-")}.pdf`;
    doc.save(filename);
    setPdfLoading(false);
  }

  if (!paper || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No results to show.</p>
      </div>
    );
  }

  const encouragement = pct >= 80 ? "Excellent work! You're exam-ready." : pct >= 60 ? "Good effort. Keep reviewing the flagged questions." : "Keep going — every attempt builds understanding.";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[700px] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Exam Complete</p>
            <p className="text-[11px] text-muted-foreground">{paper.paper_title}</p>
          </div>
          <span className="font-mono text-base font-bold text-foreground">
            {totalEarned} <span className="text-muted-foreground font-normal text-xs">/ {totalMarks}</span>
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-5">

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-lg font-serif font-semibold text-foreground">{paper.paper_title}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-foreground">{totalEarned} <span className="text-sm text-muted-foreground">/ {totalMarks}</span></p>
                <p className="text-sm text-primary font-semibold">{pct}%</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Time taken</p>
                <p className="text-xl font-bold text-foreground">{formatTime(timeTaken)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Marked</p>
                <p className="text-base font-bold text-foreground">{scoredCount} / {questions.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Flagged</p>
                <p className="text-base font-bold text-foreground">{flaggedCount}</p>
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
                needsReview={needsReview[i]}
                onScoreChange={v => setScores(prev => prev.map((s, j) => j === i ? v : s))}
                onReviewChange={v => setNeedsReview(prev => prev.map((r, j) => j === i ? v : r))}
              />
            ))}
          </div>

          {/* PDF download */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? "Generating PDF…" : "Download PDF Report"}
          </button>

          {/* Save results */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saved ? "Results Saved ✓" : saving ? "Saving…" : "Save Results to Profile"}
          </button>
          {saveError && <p className="text-center text-xs text-red-400">{saveError}</p>}

          {/* Summary after save */}
          {saved && (
            <div className="bg-primary/8 border border-primary/25 rounded-xl p-5 space-y-2 text-center">
              <p className="text-base font-bold text-foreground">{pct}% — {encouragement}</p>
              {flaggedCount > 0 && (
                <p className="text-sm text-amber-400">{flaggedCount} question{flaggedCount !== 1 ? "s" : ""} flagged for review.</p>
              )}
            </div>
          )}

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