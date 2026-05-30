import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotes } from "@/lib/questionNotesStore";
import AnswerInput from "@/components/AnswerInput";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import QuestionNoteWidget from "@/components/QuestionNoteWidget";
import QuestionSessionHeader from "@/components/QuestionSessionHeader";
import SessionNotesPanel from "@/components/SessionNotesPanel";
import QuestionMedia from "@/components/QuestionMedia";
import { csRecordAttempt, csAddToReviewBank, csWriteMistakeDna } from "@/lib/csTopicStore";
import DevQuestionJumper from "@/components/DevQuestionJumper";
import TeachMeHow from "@/components/TeachMeHow";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { useNodeAwareSubmit } from "@/hooks/useNodeAwareSubmit";
import { useAuth } from "@/lib/AuthContext";

const TOPIC_ROUTES = {
  operating_systems: "/cs/operating-systems/question",
  language_translators: "/cs/language-translators/question",
  data_representation: "/cs/data-representation/question",
  compression: "/cs/compression/question",
  computers_and_components: "/cs/computers-and-components/question",
  ethics_and_ownership: "/cs/ethics-and-ownership/question",
  networks_and_the_internet: "/cs/networks/question",
  data_security: "/cs/data-security/question",
  data_integrity: "/cs/data-integrity/question",
};

export default function CSQuestionAttempt({
  question,
  idx,
  total,
  allQuestions = [],
  sessionAnswers = {},
  onAdvance,
  onJumpTo,
  topicLabel,
  allQuestionsForDev,
  onOverride,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [showTeachMe, setShowTeachMe] = useState(false);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const { submit, loading, error, setError } = useNodeAwareSubmit();
  const submittedRef = useRef(false);

  // Notes badge count
  const allNotes = getAllNotes();
  const notesCount = allQuestions.filter(q => allNotes[q.id]?.text).length;

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-[480px] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">No questions available right now.</p>
          <button onClick={() => navigate("/cs")} className="text-sm text-blue-400">Back to CS dashboard</button>
        </div>
      </div>
    );
  }

  const topicRoute = TOPIC_ROUTES[question.topic_key] ?? "/cs";
  const isEmpty = answer.trim().length === 0;

  function goToFeedback(fb, ans) {
    const marksEarned = fb.marks_earned ?? 0;
    const isLastQuestion = idx + 1 >= total;
    onAdvance("correct", marksEarned >= question.total_marks);
    navigate("/cs/feedback", {
      state: {
        feedback: fb, answer: ans,
        topicKey: question.topic_key, questionId: question.id,
        totalMarks: question.total_marks,
        topicRoute: isLastQuestion ? null : topicRoute,
        backRoute: topicRoute, dashRoute: "/cs",
        paperRef: question.paper_ref,
        topicLabel: topicLabel ?? question.topic,
        isLastQuestion,
      },
    });
  }

  const handleSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const fb = await submit(question, answer);
    if (!fb) { submittedRef.current = false; return; }

    const marksEarned = fb.marks_earned ?? 0;
    await csRecordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });
    if (marksEarned < question.total_marks) {
      csWriteMistakeDna(fb, question.id, question.topic, marksEarned, question.total_marks, answer).catch(() => {});
      await csAddToReviewBank({
        question_id: question.id, topic: question.topic, question_text: question.text,
        mark_scheme: "", total_marks: question.total_marks,
        first_attempt_score: marksEarned, first_attempt_feedback: fb.cambridge_insight ?? "",
        first_attempt_answer: answer,
      });
    }
    goToFeedback(fb, answer);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* ── P1-style header (no calculator/formula for CS) ───────────── */}
        <QuestionSessionHeader
          paperRef={question.paper_ref}
          subject="Computer Science"
          currentIdx={idx}
          total={total}
          allQuestions={allQuestions}
          sessionAnswers={sessionAnswers}
          onBack={() => navigate("/cs")}
          onJumpTo={onJumpTo}
          notesCount={notesCount}
          onNotesPanel={() => setNotesPanelOpen(true)}
          showCalculator={false}
        />

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* Question card with annotation toolbar */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                {question.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {question.topic}
                </span>
                <span className="font-mono text-xs text-muted-foreground">[{question.total_marks}m]</span>
              </div>
            </div>
            <QuestionMedia question={question} />
            <QuestionAnnotator text={question.text} questionId={question.id} />
          </div>

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

          {allQuestionsForDev && onOverride && (
            <DevQuestionJumper
              allQuestions={allQuestionsForDev}
              onJump={(q) => { onOverride(q); setAnswer(""); setShowTeachMe(false); setError(null); }}
            />
          )}
        </div>
      </div>

      {/* Notes / Workings panel */}
      <SessionNotesPanel
        open={notesPanelOpen}
        onClose={() => setNotesPanelOpen(false)}
        allQuestions={allQuestions}
        currentIdx={idx}
        onJumpTo={(i) => { onJumpTo?.(i); setNotesPanelOpen(false); }}
        subject="cs"
        userEmail={user?.email ?? ""}
      />

      {loading && <SubmittingOverlay />}
    </div>
  );
}