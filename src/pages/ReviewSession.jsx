import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Flame, X } from "lucide-react";
import AnswerInput from "../components/AnswerInput";
import QuestionMedia from "../components/QuestionMedia";
import QuestionAnnotator from "../components/QuestionAnnotator";
import QuestionSessionHeader from "../components/QuestionSessionHeader";
import SessionNotesPanel from "../components/SessionNotesPanel";
import ScientificCalculator from "../components/ScientificCalculator";
import SubmitButton from "../components/SubmitButton";
import { getReviewBank, recordAttempt, updateReviewBankEntry, incrementReviewBankClears, isSimilarAnswer } from "../lib/topicStore";
import { getAllNotes } from "@/lib/questionNotesStore";
import { useAuth } from "@/lib/AuthContext";
import { FORMULA_SHEET_URL } from "@/lib/physicsP1Bank";

function FormulaSheetModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-[700px] bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 sticky top-0 bg-card z-10">
          <p className="font-bold text-foreground">Data / Formula Sheet</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-2">
          <img src={FORMULA_SHEET_URL} alt="Formula sheet" className="w-full rounded-lg" style={{ background: "#fff" }} />
        </div>
      </div>
    </div>
  );
}

export default function ReviewSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bank, setBank] = useState([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [calcActive, setCalcActive] = useState(false);
  const [formulaSheetOpen, setFormulaSheetOpen] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState({});

  useEffect(() => {
    getReviewBank().then((rb) => { setBank(rb); setBankLoading(false); });
  }, []);

  const current = bank[currentIndex];

  if (bankLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">
        <p className="text-lg font-semibold text-foreground max-w-sm leading-relaxed">
          No questions in your review bank right now.
        </p>
        <button onClick={() => navigate("/physics")} className="mt-8 text-sm text-primary hover:brightness-110">
          Back to dashboard
        </button>
      </div>
    );
  }

  const isPersistentAttempt = isSimilarAnswer(
    answer,
    current.last_wrong_answer ?? current.first_attempt_answer ?? ""
  );

  // Notes badge
  const allNotes = getAllNotes();
  const allBankQuestions = bank.map(q => ({
    id: q.question_id,
    topic: q.topic,
    text: q.question_text,
  }));
  const notesCount = allBankQuestions.filter(q => allNotes[q.id]?.text).length;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const persistenceContext = (isPersistentAttempt && answer.trim().length > 10)
      ? `\n\nIMPORTANT: The student has given essentially the same wrong answer as before — a PERSISTENT MISUNDERSTANDING. In cambridge_insight, name the exact misconception and explain clearly why it is wrong.`
      : "";

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Cambridge A Level Physics examiner. A student is reviewing a question they previously got wrong.${persistenceContext}

Question: "${current.question_text}"
Mark scheme: ${current.mark_scheme}
Total marks: ${current.total_marks}
Student's answer: ${answer}

Respond in JSON only:
{
  "marks_earned": [number out of ${current.total_marks}],
  "mark_1": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence" },
  "mark_2": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence" },
  "cambridge_insight": "two sentences on what Cambridge expects",
  "pulse_layer_1": "The reusable exam rule in ≤12 words.",
  "next_step": "one sentence on what to focus on next"
}`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          marks_earned: { type: "number" },
          mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
          cambridge_insight: { type: "string" },
          pulse_layer_1: { type: "string" },
          next_step: { type: "string" },
        },
      },
    }).catch(() => null);

    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }

    const result = feedback.response ?? feedback;
    const newScore = result.marks_earned ?? 0;
    const isFullMarks = newScore >= current.total_marks;

    setSessionAnswers(prev => ({
      ...prev,
      [current.question_id]: isFullMarks ? "correct" : "wrong",
    }));

    await recordAttempt(current.topic, newScore, { total_marks: current.total_marks, question_id: current.question_id });
    sessionStorage.setItem("review_gate_attempt", "1");

    const { removed, isPersistent } = await updateReviewBankEntry(current.question_id, answer, isFullMarks);

    if (isFullMarks) {
      await incrementReviewBankClears();
      const remainingBank = await getReviewBank();
      navigate("/review-affirmation", {
        state: { bankEmpty: remainingBank.length === 0, updatedBank: remainingBank },
      });
    } else {
      navigate("/feedback", {
        state: {
          feedback: result,
          answer,
          isReview: true,
          isPersistentMisunderstanding: isPersistent,
          topicKey: current.topic?.toLowerCase().replace(/\s+/g, "_"),
          questionId: current.question_id,
          backRoute: "/physics",
          paperRef: "Review Bank",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">

        {/* ── P1-style header with all icons ──────────────────────────── */}
        <QuestionSessionHeader
          paperRef="Written Review Bank"
          subject="Physics"
          currentIdx={currentIndex}
          total={bank.length}
          allQuestions={allBankQuestions}
          sessionAnswers={sessionAnswers}
          onBack={() => navigate("/review-bank")}
          onJumpTo={(i) => { setCurrentIndex(i); setAnswer(""); setError(null); }}
          notesCount={notesCount}
          onNotesPanel={() => setNotesPanelOpen(true)}
          showCalculator={true}
          calcActive={calcActive}
          onCalcToggle={() => setCalcActive(a => !a)}
          onFormulaSheet={() => setFormulaSheetOpen(true)}
        />

        <div className="flex-1 flex flex-col gap-4 p-4">

          {/* Calculator */}
          {calcActive && (
            <div className="relative z-10">
              <ScientificCalculator onClose={() => setCalcActive(false)} />
            </div>
          )}

          {/* Context banner */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-foreground/60 leading-relaxed">
              <span className="text-amber-400/80 font-medium">{current.first_attempt_score}/{current.total_marks} marks</span>
              {" · "}
              {current.persistent_misunderstanding
                ? "⚠ Persistent misunderstanding — focus on what's different this time."
                : current.first_attempt_score === 0
                  ? "You missed this last time. Trust what you've learned since."
                  : "You were close. One more piece and this is yours."}
            </p>
          </div>

          {/* Persistent warning WHILE typing */}
          {isPersistentAttempt && answer.trim().length > 10 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300/90 leading-relaxed">
                ⚠ This looks very similar to your previous wrong answer. Try a fundamentally different approach.
              </p>
            </div>
          )}

          {/* Question card with annotation toolbar */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                Review Q{currentIndex + 1}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {current.topic}
              </span>
            </div>
            <QuestionMedia question={current} />
            <QuestionAnnotator text={current.question_text} questionId={current.question_id} />
            <div className="flex justify-end">
              <span className="font-mono text-xs text-muted-foreground">[{current.total_marks} mark{current.total_marks !== 1 ? "s" : ""}]</span>
            </div>
          </div>

          <AnswerInput value={answer} onChange={setAnswer} />
          <SubmitButton disabled={answer.trim().length === 0 || loading} loading={loading} onClick={handleSubmit} />
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}

          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="font-mono text-[11px] text-muted-foreground/50">Review counts toward your streak</span>
          </div>
        </div>
      </div>

      {/* Notes / Workings panel */}
      <SessionNotesPanel
        open={notesPanelOpen}
        onClose={() => setNotesPanelOpen(false)}
        allQuestions={allBankQuestions}
        currentIdx={currentIndex}
        onJumpTo={(i) => { setCurrentIndex(i); setNotesPanelOpen(false); }}
        subject="physics"
        userEmail={user?.email ?? ""}
      />

      {formulaSheetOpen && <FormulaSheetModal onClose={() => setFormulaSheetOpen(false)} />}
    </div>
  );
}