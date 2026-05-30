import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Star } from "lucide-react";
import { getAllNotes } from "@/lib/questionNotesStore";
import AnswerInput from "@/components/AnswerInput";
import QuestionAnnotator from "@/components/QuestionAnnotator";
import QuestionSessionHeader from "@/components/QuestionSessionHeader";
import SessionNotesPanel from "@/components/SessionNotesPanel";
import QuestionMedia from "@/components/QuestionMedia";
import ScientificCalculator from "@/components/ScientificCalculator";
import ScratchpadPanel from "@/components/ScratchpadPanel";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "@/lib/topicStore";
import { loadWorkings as loadTopicWorkings, saveWorking as saveTopicWorking } from "@/lib/p1WorkingsStore";
import { isStarred, starQuestion, unstarQuestion, getAllStarred } from "@/lib/writtenStarStore";
import DevQuestionJumper from "@/components/DevQuestionJumper";
import TeachMeHow from "@/components/TeachMeHow";
import SubmittingOverlay from "@/components/SubmittingOverlay";
import { useNodeAwareSubmit } from "@/hooks/useNodeAwareSubmit";
import { useAuth } from "@/lib/AuthContext";
import { FORMULA_SHEET_URL } from "@/lib/physicsP1Bank";

const SUBJECT = "physics";

function sessionKey(topicKey) { return `q_session_answers_${topicKey}`; }
function loadSessionAnswers(topicKey) { try { return JSON.parse(sessionStorage.getItem(sessionKey(topicKey)) ?? "{}"); } catch { return {}; } }
function saveSessionAnswers(topicKey, answers) { sessionStorage.setItem(sessionKey(topicKey), JSON.stringify(answers)); }

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

export default function TopicalQuestionPage({ getNext, advance, allQuestions = [], backRoute = "/physics" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const topicKey = allQuestions[0]?.topic_key ?? "unknown";

  const [currentBankIdx, setCurrentBankIdx] = useState(() => getNext().idx);
  const [answer, setAnswer] = useState("");
  const [showTeachMe, setShowTeachMe] = useState(false);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [calcActive, setCalcActive] = useState(false);
  const [formulaSheetOpen, setFormulaSheetOpen] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState(() => loadSessionAnswers(topicKey));
  const [workings, setWorkings] = useState({});
  const [currentStarred, setCurrentStarred] = useState(false);
  const [panelItemCount, setPanelItemCount] = useState(0);

  const { submit, loading, error, setError } = useNodeAwareSubmit();

  useEffect(() => { loadTopicWorkings(topicKey).then(w => setWorkings(w ?? {})); }, [topicKey]);

  useEffect(() => {
    const allNotes = getAllNotes();
    const notesCount = allQuestions.filter(q => allNotes[q.id]?.text).length;
    const starredCount = getAllStarred(SUBJECT).length;
    setPanelItemCount(notesCount + starredCount);
  });

  const question = allQuestions[currentBankIdx] ?? getNext().question;
  const total = allQuestions.length || getNext().total;
  const thisRoute = location.pathname;

  useEffect(() => {
    setCurrentStarred(question ? isStarred(question.id, SUBJECT) : false);
  }, [question?.id]);

  function jumpToQuestion(idx) { setCurrentBankIdx(idx); setAnswer(""); setShowTeachMe(false); setError(null); }

  function handleToggleStar() {
    if (!question) return;
    if (currentStarred) { unstarQuestion(question.id, SUBJECT); setCurrentStarred(false); }
    else { starQuestion(question.id, { topic: question.topic, questionText: question.text, markScheme: question.mark_scheme ?? "" }, SUBJECT); setCurrentStarred(true); }
  }

  function handleSaveWorking(side, imageData) {
    if (!question) return;
    const updated = saveTopicWorking(topicKey, question.id, side, imageData, { questionNumber: currentBankIdx + 1, topic: question.topic, questionText: question.text });
    setWorkings({ ...updated });
  }

  const handleSubmit = useCallback(async () => {
    const fb = await submit(question, answer);
    if (!fb) return;
    const marksEarned = fb.marks_earned ?? 0;
    const isCorrect = marksEarned >= question.total_marks;
    const updated = { ...sessionAnswers, [question.id]: isCorrect ? "correct" : "wrong" };
    setSessionAnswers(updated);
    saveSessionAnswers(topicKey, updated);
    await recordAttempt(question.topic_key, marksEarned, { total_marks: question.total_marks, question_id: question.id });
    if (!isCorrect) {
      writeMistakeDna(fb, question.id, question.topic, marksEarned, question.total_marks, answer).catch(() => {});
      await addToReviewBank({ question_id: question.id, topic: question.topic, question_text: question.text, mark_scheme: question.mark_scheme ?? "", total_marks: question.total_marks, first_attempt_score: marksEarned, first_attempt_feedback: fb.cambridge_insight ?? "", first_attempt_answer: answer });
    }
    advance();
    navigate("/feedback", { state: { feedback: fb, answer, topicKey: question.topic_key, questionId: question.id, questionText: question.text, markScheme: question.mark_scheme ?? "", topicLabel: question.topic, nextFullRoute: thisRoute, nextRetryRoute: thisRoute, backRoute, paperRef: question.paper_ref } });
  }, [question, answer, sessionAnswers, topicKey, submit, advance, navigate, thisRoute, backRoute]);

  const isEmpty = answer.trim().length === 0;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[540px] flex flex-col min-h-screen">
        <QuestionSessionHeader
          paperRef={question.paper_ref} subject="Physics"
          currentIdx={currentBankIdx} total={total}
          allQuestions={allQuestions} sessionAnswers={sessionAnswers}
          onBack={() => navigate(backRoute)} onJumpTo={jumpToQuestion}
          notesCount={panelItemCount} onNotesPanel={() => setNotesPanelOpen(true)}
          showCalculator={true} calcActive={calcActive}
          onCalcToggle={() => setCalcActive(a => !a)}
          onFormulaSheet={() => setFormulaSheetOpen(true)}
        />

        <div className="flex-1 flex flex-col gap-4 p-4">
          {calcActive && <div className="relative z-10"><ScientificCalculator onClose={() => setCalcActive(false)} /></div>}

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">{question.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{question.topic}</span>
                <span className="font-mono text-xs text-muted-foreground">[{question.total_marks}m]</span>
                <button onClick={handleToggleStar}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${currentStarred ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-secondary border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"}`}>
                  <Star className={`w-3 h-3 ${currentStarred ? "fill-amber-400" : ""}`} />
                  {currentStarred ? "Starred" : "Star"}
                </button>
              </div>
            </div>
            <QuestionMedia question={question} />
            <QuestionAnnotator text={question.text} questionId={question.id} />
          </div>

          {showTeachMe ? <TeachMeHow onClose={() => setShowTeachMe(false)} /> : (
            <>
              <AnswerInput value={answer} onChange={setAnswer} />
              <div className="flex gap-2">
                <button onClick={() => setShowTeachMe(true)} disabled={!isEmpty} className="flex-1 border border-border text-muted-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed">Teach Me How</button>
                <button onClick={handleSubmit} disabled={isEmpty || loading} className="flex-1 bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? "Marking…" : "Submit"}
                </button>
              </div>
              {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
            </>
          )}

          <DevQuestionJumper allQuestions={allQuestions} onJump={(q) => { const idx = allQuestions.findIndex(aq => aq.id === q.id); jumpToQuestion(idx >= 0 ? idx : 0); setAnswer(""); setShowTeachMe(false); setError(null); }} />
        </div>
      </div>

      <ScratchpadPanel questionId={question?.id} paperId={topicKey} workings={workings} onSaveWorking={handleSaveWorking} />
      <SessionNotesPanel open={notesPanelOpen} onClose={() => setNotesPanelOpen(false)} allQuestions={allQuestions} currentIdx={currentBankIdx} onJumpTo={(i) => { jumpToQuestion(i); setNotesPanelOpen(false); }} subject={SUBJECT} userEmail={user?.email ?? ""} />
      {formulaSheetOpen && <FormulaSheetModal onClose={() => setFormulaSheetOpen(false)} />}
      {loading && <SubmittingOverlay />}
    </div>
  );
}