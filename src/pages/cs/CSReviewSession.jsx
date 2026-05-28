/**
 * CS Review Session — serves questions from the CS review bank.
 * All reads/writes go to cs_data, never Physics data.
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import QuestionMedia from "@/components/QuestionMedia";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { useNodeAwareSubmit } from "@/hooks/useNodeAwareSubmit";
import { csGetReviewBank, csRemoveFromReviewBank, csResetReviewBankLock } from "@/lib/csTopicStore";

// All CS question banks keyed by question ID for lookup
import { OS_QUESTIONS } from "@/lib/csOSBank";
import { LT_QUESTIONS } from "@/lib/csLTBank";
import { DATA_REP_QUESTIONS } from "@/lib/csDataRepBank";
import { COMPRESSION_QUESTIONS } from "@/lib/csCompressionBank";
import { COMP_QUESTIONS } from "@/lib/csCompAndCompBank";
import { ETHICS_QUESTIONS } from "@/lib/csEthicsBank";
import { NETWORKS_QUESTIONS } from "@/lib/csNetworksBank";
import { DATA_SECURITY_QUESTIONS } from "@/lib/csDataSecurityBank";
import { DATA_INTEGRITY_QUESTIONS } from "@/lib/csDataIntegrityBank";

const ALL_CS_QUESTIONS = [
  ...OS_QUESTIONS, ...LT_QUESTIONS, ...DATA_REP_QUESTIONS,
  ...COMPRESSION_QUESTIONS, ...COMP_QUESTIONS, ...ETHICS_QUESTIONS,
  ...NETWORKS_QUESTIONS, ...DATA_SECURITY_QUESTIONS, ...DATA_INTEGRITY_QUESTIONS,
];
const QUESTION_MAP = Object.fromEntries(ALL_CS_QUESTIONS.map(q => [q.id, q]));

export default function CSReviewSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [bank, setBank] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loadingBank, setLoadingBank] = useState(true);
  const { submit, loading, error } = useNodeAwareSubmit();

  useEffect(() => {
    csGetReviewBank().then(rb => {
      const unlocked = rb.filter(q => {
        if (!q.locked_until) return true;
        return new Date(q.locked_until).getTime() <= Date.now();
      });
      setBank(unlocked);
      if (state?.questionId) {
        const idx = unlocked.findIndex(q => q.question_id === state.questionId);
        if (idx >= 0) setCurrentIdx(idx);
      }
      setLoadingBank(false);
    });
  }, []);

  if (loadingBank) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (bank.length === 0) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-[480px] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">No questions ready to review right now.</p>
          <button onClick={() => navigate("/cs")} className="text-sm text-blue-400">Back to CS dashboard</button>
        </div>
      </div>
    );
  }

  const reviewEntry = bank[currentIdx];
  const question = QUESTION_MAP[reviewEntry?.question_id];

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-[480px] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">Question not found in bank.</p>
          <button onClick={() => navigate("/cs/review-bank")} className="text-sm text-blue-400">Back to review bank</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    const fb = await submit(question, answer);
    if (!fb) return;

    const marksEarned = fb.marks_earned ?? 0;
    const fullMarks = marksEarned >= question.total_marks;

    if (fullMarks) {
      await csRemoveFromReviewBank(question.id);
    } else {
      await csResetReviewBankLock(question.id);
    }

    navigate("/cs/feedback", {
      state: {
        feedback: fb,
        answer,
        topicKey: question.topic_key,
        questionId: question.id,
        totalMarks: question.total_marks,
        backRoute: "/cs/review-bank",
        dashRoute: "/cs",
        paperRef: question.paper_ref,
        isReview: true,
        fullMarks,
        remainingCount: bank.length - 1,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/cs/review-bank")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CS Review</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {question.paper_ref}
          </span>
        </div>

        {/* Past attempt context banner */}
        <div className="mx-4 mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-400/80 font-medium">
            Review question — you scored {reviewEntry.first_attempt_score}/{reviewEntry.total_marks} on your first attempt.
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {currentIdx + 1} of {bank.length} in review
              </span>
            </div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {question.topic}
            </span>
            <QuestionMedia question={question} />
            <p className="text-[15px] leading-relaxed text-foreground/90">{question.text}</p>
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">
                [{question.total_marks} mark{question.total_marks !== 1 ? "s" : ""}]
              </span>
            </div>
          </div>

          <AnswerInput value={answer} onChange={setAnswer} />
          <button
            onClick={handleSubmit}
            disabled={answer.trim().length === 0 || loading}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Marking…" : "Submit Answer"}
          </button>
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
        </div>
      </div>

      {loading && <SubmittingOverlay />}
    </div>
  );
}