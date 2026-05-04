/**
 * MockExamSession — question-by-question mock exam with inline AI feedback.
 * Each sub-part is answered, then AI feedback is shown before moving on.
 */
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getMockPaper } from "@/lib/mockExamPapers";
import { buildExamPrompt, buildExamResponseSchema } from "@/lib/examPapers";
import MarkdownText from "@/components/mock/MarkdownText";
import MockQuestionDisplay from "@/components/mock/MockQuestionDisplay";

// ─── Inline feedback panel shown after submission ─────────────────────────
function FeedbackPanel({ feedback, question, onNext, isLast }) {
  const { marks_earned, mark_breakdown = [], cambridge_insight, examiner_comment } = feedback;
  const total = question.total_marks;
  const perfect = marks_earned >= total;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Score banner */}
      <div className={`flex items-center gap-4 rounded-xl p-4 border ${perfect ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
        {perfect
          ? <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
          : <XCircle className="w-8 h-8 text-amber-400 shrink-0" />}
        <div>
          <p className="font-bold text-foreground text-lg">{marks_earned} / {total} marks</p>
          <p className="text-xs text-muted-foreground">{perfect ? "Full marks!" : "Keep going — every attempt builds understanding."}</p>
        </div>
      </div>

      {/* Mark breakdown */}
      {mark_breakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mark Breakdown</p>
          {mark_breakdown.map((mb, i) => (
            <div key={i} className={`flex items-start gap-2.5 text-sm p-2.5 rounded-lg ${mb.awarded ? "bg-green-500/8 border border-green-500/20" : "bg-red-500/8 border border-red-500/20"}`}>
              <span className={`shrink-0 font-bold mt-0.5 ${mb.awarded ? "text-green-400" : "text-red-400"}`}>{mb.awarded ? "✓" : "✗"}</span>
              <div>
                <p className={`text-xs font-semibold mb-0.5 ${mb.awarded ? "text-green-300" : "text-red-300"}`}>{mb.point}</p>
                <p className="text-xs text-foreground/70 leading-relaxed">{mb.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark scheme */}
      <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Official Mark Scheme</p>
        <p className="text-xs text-foreground/80 leading-relaxed">{question.mark_scheme}</p>
      </div>

      {/* Cambridge insight */}
      {cambridge_insight && (
        <div className="bg-primary/8 border border-primary/25 rounded-xl p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Cambridge Insight</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{cambridge_insight}</p>
        </div>
      )}

      {examiner_comment && (
        <p className="text-[11px] text-muted-foreground/60 italic px-1">{examiner_comment}</p>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
      >
        {isLast ? "See Final Summary →" : "Next Question →"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Answer input (written only for now — extensible) ────────────────────
function AnswerBox({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Write your answer here — use Cambridge language..."
      rows={5}
      className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      style={{ minHeight: 120 }}
    />
  );
}

// ─── Main session component ───────────────────────────────────────────────
export default function MockExamSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const paper = getMockPaper(state?.paperId);

  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState([]); // array of marks_earned per question

  const questions = paper?.questions ?? [];
  const N = questions.length;
  const q = questions[idx];
  const totalMarks = questions.reduce((s, q) => s + q.total_marks, 0);
  const earnedSoFar = scores.reduce((s, v) => s + v, 0);
  const marksAvailableSoFar = questions.slice(0, scores.length).reduce((s, q) => s + q.total_marks, 0);
  const isLast = idx === N - 1;

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || loading || !q) return;
    setLoading(true);
    // Mock exam questions use question_text; buildExamPrompt expects .text
    const prompt = buildExamPrompt({ ...q, text: q.question_text ?? q.text }, answer);
    const schema = buildExamResponseSchema(q.total_marks);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: schema,
    }).catch(() => null);
    setLoading(false);
    if (!result) return;
    const fb = result?.response ?? result;
    setFeedback(fb);
    setScores(prev => [...prev, fb.marks_earned ?? 0]);
  }, [answer, loading, q]);

  const handleNext = useCallback(() => {
    if (isLast) {
      navigate("/mock-exam/summary", {
        state: { paperId: paper?.id, questions, scores: [...scores], answers: [] }
      });
      return;
    }
    setIdx(i => i + 1);
    setAnswer("");
    setFeedback(null);
  }, [isLast, scores, questions, paper?.id, navigate]);

  if (!paper) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Paper not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            <button
              onClick={() => navigate("/mock-exam")}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[160px]">{paper.displayName}</span>
            <span className="text-xs font-mono text-muted-foreground shrink-0">{idx + 1} / {N}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-0.5 bg-secondary">
            <div
              className="h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${((idx + (feedback ? 1 : 0)) / N) * 100}%` }}
            />
          </div>

          {/* Progress stats */}
          <div className="flex items-center justify-between px-4 py-2 text-[11px] text-muted-foreground border-t border-border/30">
            <span className="font-medium text-foreground">{q.question_number}</span>
            <span>{idx + 1} of {N} sub-questions</span>
            {scores.length > 0 && (
              <span className="text-primary font-semibold">{earnedSoFar} / {marksAvailableSoFar} marks</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          {/* Question card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                {q.question_number}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{q.topic}</span>
                <span className="font-mono text-xs text-muted-foreground">[{q.total_marks} mark{q.total_marks !== 1 ? "s" : ""}]</span>
              </div>
            </div>

            <MockQuestionDisplay question={q} />
          </div>

          {/* Answer input (if not yet submitted) */}
          {!feedback && (
            <>
              <AnswerBox value={answer} onChange={setAnswer} />
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || loading}
                className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Marking with AI…
                  </span>
                ) : "Submit Answer"}
              </button>
            </>
          )}

          {/* Your answer recap (shown after submission) */}
          {feedback && answer.trim() && (
            <div className="bg-secondary/40 border border-border rounded-xl px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{answer}</p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <FeedbackPanel
              feedback={feedback}
              question={q}
              onNext={handleNext}
              isLast={isLast}
            />
          )}
        </div>
      </div>
    </div>
  );
}