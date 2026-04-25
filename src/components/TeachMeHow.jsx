/**
 * TeachMeHow — progressive hint flow for written questions.
 * Shown when student clicks "Teach Me How" on an empty input.
 *
 * Props:
 *   question: the question object (must have .text, .total_marks, .mark_scheme, .prompt fn, .response_schema)
 *   onFinalSubmit: (feedback, answer) => void — called after the second attempt is marked
 *   onClose: () => void — called to dismiss and go back to normal question flow
 */
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown } from "lucide-react";
import VoiceInput from "./VoiceInput";

const STAGES = {
  INITIAL_ATTEMPT: "initial_attempt",    // Step 1-3: minimal input + AI marking
  HINT_1: "hint_1",                      // Show "Show me the key concept" button
  HINT_2: "hint_2",                      // Show "What does Cambridge want?"
  HINT_3: "hint_3",                      // Show "Show full mark scheme"
  FINAL_ATTEMPT: "final_attempt",        // Step 5: "Now write it in your own words"
};

export default function TeachMeHow({ question, onFinalSubmit, onClose }) {
  const [stage, setStage] = useState(STAGES.INITIAL_ATTEMPT);
  const [minimalInput, setMinimalInput] = useState("");
  const [finalInput, setFinalInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialFeedback, setInitialFeedback] = useState(null);

  // Derived from question — extract hints from mark scheme text
  const markSchemeText = question.mark_scheme || "";

  // Simple hint extraction: split mark scheme into concept / structure / full
  function getHint1() {
    // Key concept: what is the question fundamentally testing?
    if (markSchemeText) {
      const lines = markSchemeText.split(/\n|\./).filter(l => l.trim().length > 10);
      return lines[0] || "Focus on the core definition or principle being tested.";
    }
    return "Think about what physical/computational concept this question is fundamentally testing.";
  }

  function getHint2() {
    return `Cambridge wants you to use precise technical language. State the concept clearly, then explain the mechanism. Use the exact keywords from your syllabus.`;
  }

  function getHint3() {
    return markSchemeText || "See the full mark scheme in your revision notes.";
  }

  async function handleMinimalSubmit() {
    if (!minimalInput.trim()) return;
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: question.prompt(minimalInput),
      model: "claude_sonnet_4_6",
      response_json_schema: question.response_schema,
    }).catch(() => null);
    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }
    setInitialFeedback(feedback.response ?? feedback);
    setStage(STAGES.HINT_1);
  }

  async function handleFinalSubmit() {
    if (!finalInput.trim()) return;
    setLoading(true);
    setError(null);
    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: question.prompt(finalInput),
      model: "claude_sonnet_4_6",
      response_json_schema: question.response_schema,
    }).catch(() => null);
    setLoading(false);
    if (!feedback) { setError("Something went wrong. Please try again."); return; }
    onFinalSubmit(feedback.response ?? feedback, finalInput);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">Teach Me How</p>
        <p className="text-xs text-foreground/70 leading-relaxed">
          We'll walk through this together. Start with what you know.
        </p>
      </div>

      {/* Stage: minimal attempt */}
      {stage === STAGES.INITIAL_ATTEMPT && (
        <div className="space-y-3">
          <label className="text-xs text-muted-foreground leading-relaxed">
            Write at least one word or idea before we walk through it together
          </label>
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={minimalInput}
                onChange={e => setMinimalInput(e.target.value)}
                placeholder="Just one idea — anything you know..."
                rows={3}
                className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>
            <VoiceInput onTranscript={setMinimalInput} />
          </div>
          {minimalInput.trim().length > 0 && (
            <button
              onClick={handleMinimalSubmit}
              disabled={loading}
              className="w-full bg-primary/20 border border-primary/40 text-primary font-semibold text-sm py-3 rounded-xl hover:bg-primary/30 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? "Thinking..." : "Submit my idea →"}
            </button>
          )}
          {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
          <button onClick={onClose} className="w-full text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1">
            ← Back to normal answer
          </button>
        </div>
      )}

      {/* Hint stages */}
      {[STAGES.HINT_1, STAGES.HINT_2, STAGES.HINT_3, STAGES.FINAL_ATTEMPT].includes(stage) && (
        <div className="space-y-3">

          {/* Hint 1 */}
          {stage === STAGES.HINT_1 && (
            <button
              onClick={() => setStage(STAGES.HINT_2)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:brightness-110 transition-all text-left"
            >
              <span className="text-sm font-medium text-foreground">Show me the key concept</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {[STAGES.HINT_2, STAGES.HINT_3, STAGES.FINAL_ATTEMPT].includes(stage) && (
            <div className="bg-card border border-border border-l-4 border-l-primary/40 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">Key Concept</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{getHint1()}</p>
            </div>
          )}

          {/* Hint 2 */}
          {stage === STAGES.HINT_2 && (
            <button
              onClick={() => setStage(STAGES.HINT_3)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:brightness-110 transition-all text-left"
            >
              <span className="text-sm font-medium text-foreground">What does Cambridge want?</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {[STAGES.HINT_3, STAGES.FINAL_ATTEMPT].includes(stage) && (
            <div className="bg-card border border-border border-l-4 border-l-amber-500/40 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">Cambridge Expects</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{getHint2()}</p>
            </div>
          )}

          {/* Hint 3 */}
          {stage === STAGES.HINT_3 && (
            <button
              onClick={() => setStage(STAGES.FINAL_ATTEMPT)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:brightness-110 transition-all text-left"
            >
              <span className="text-sm font-medium text-foreground">Show full mark scheme</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {stage === STAGES.FINAL_ATTEMPT && (
            <>
              <div className="bg-card border border-border border-l-4 border-l-green-500/40 rounded-xl p-4 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-green-400/60">Full Mark Scheme</p>
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{getHint3()}</p>
              </div>

              {/* Final attempt */}
              <div className="space-y-3 pt-1">
                <label className="text-xs text-muted-foreground">Now write it in your own words</label>
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={finalInput}
                      onChange={e => setFinalInput(e.target.value)}
                      placeholder="Write your answer using Cambridge language..."
                      rows={4}
                      maxLength={800}
                      className="w-full bg-card border border-white/8 rounded-xl p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                    />
                    <span className="absolute bottom-3 right-4 font-mono text-[11px] text-muted-foreground/50">
                      {finalInput.length}/800
                    </span>
                  </div>
                  <VoiceInput onTranscript={setFinalInput} />
                </div>
                <button
                  onClick={handleFinalSubmit}
                  disabled={finalInput.trim().length === 0 || loading}
                  className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Marking..." : "Submit Answer"}
                </button>
                {error && <p className="text-center text-sm text-red-400/80">{error}</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}