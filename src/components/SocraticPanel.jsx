/**
 * SocraticPanel — The Appeal Chamber.
 * A slide-out Socratic tutor panel that interrogates a specific missed mark
 * via a conversational thread. Never gives away answers — only asks questions.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Scale, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getSocraticThread, appendSocraticMessage, buildThreadKey } from "@/lib/socraticStore";

const QUICK_OBJECTIONS = [
  "My method is different but structurally valid — why did I lose this mark?",
  "I don't fully understand the technical terminology used here.",
  "Show me where Cambridge explicitly requires this specific phrasing.",
];

const SOCRATIC_SYSTEM_PROMPT = `You are the Cambridge Viva Voce Examiner — a strict Socratic tutor embedded inside an AI exam preparation platform.

Your one and only role is to guide the student to discover their own mistake through short, pointed counter-questions. You are STRICTLY FORBIDDEN from:
- Giving the direct answer or rephrasing the mark scheme
- Telling the student what to write
- Confirming whether their latest message is correct or incorrect
- Using more than 4 bullet points in a single response

Your responses MUST:
- Be short: 2-4 bullet questions maximum per turn
- Start each bullet with "→"
- Challenge the student's underlying physics, mathematics, or CS logic
- Reference only what the student wrote — do not introduce new information
- End with a single focused question that propels them forward

Tone: precise, calm, intellectually rigorous — like a Cambridge oral examiner.

If the student says they don't understand terminology, define the term using only a question: e.g. "→ What does 'per unit' imply mathematically about how you would express this ratio?"

If the student claims their method is equivalent, probe the structural equivalence: "→ Does your phrasing explicitly convey the direction/magnitude/ratio Cambridge requires, or does it assume the reader infers it?"

Never break character. Never say "great question" or use filler affirmations.`;

const SUBJECT_THEME = {
  physics: {
    accent: "text-cyan-400",
    accentBg: "bg-cyan-400/10",
    accentBorder: "border-cyan-400/30",
    headerGradient: "from-cyan-950/80 to-[#0d0d1a]/95",
    sendBg: "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300",
    pillBg: "bg-cyan-400/10 border-cyan-400/20 text-cyan-300",
    quickBtn: "border-cyan-500/20 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300",
  },
  cs: {
    accent: "text-violet-400",
    accentBg: "bg-violet-400/10",
    accentBorder: "border-violet-400/30",
    headerGradient: "from-violet-950/80 to-[#0d0d1a]/95",
    sendBg: "bg-violet-500/20 hover:bg-violet-500/30 border-violet-500/40 text-violet-300",
    pillBg: "bg-violet-400/10 border-violet-400/20 text-violet-300",
    quickBtn: "border-violet-500/20 text-violet-400/70 hover:bg-violet-500/10 hover:text-violet-300",
  },
  math: {
    accent: "text-emerald-400",
    accentBg: "bg-emerald-400/10",
    accentBorder: "border-emerald-400/30",
    headerGradient: "from-emerald-950/80 to-[#0d0d1a]/95",
    sendBg: "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300",
    pillBg: "bg-emerald-400/10 border-emerald-400/20 text-emerald-300",
    quickBtn: "border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-300",
  },
};

function MessageBubble({ msg, theme }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 mt-1">
          <Scale className="w-3 h-3 text-white/40" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-white/8 border border-white/10 text-white/85"
            : `${theme.accentBg} border ${theme.accentBorder} text-white/90`
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function SocraticPanel({
  open,
  onClose,
  mark,
  markIdx,
  questionId,
  questionText,
  studentAnswer,
  cambridgeInsight,
  subject,
}) {
  const theme = SUBJECT_THEME[subject] ?? SUBJECT_THEME.physics;
  const threadKey = buildThreadKey(questionId, markIdx);

  const [messages, setMessages] = useState(() => getSocraticThread(threadKey));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    setMessages(getSocraticThread(buildThreadKey(questionId, markIdx)));
    setInput("");
    setError(null);
  }, [questionId, markIdx]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setError(null);
    setShowQuick(false);

    const userMsg = { role: "user", content: trimmed };
    const updatedMsgs = appendSocraticMessage(threadKey, userMsg);
    setMessages([...updatedMsgs]);
    setLoading(true);

    // Build conversation for Anthropic — inject context as first exchange
    const contextBlock = `QUESTION: "${questionText}"

MISSED MARK: [${mark.notation}] — "${mark.description}"

WHAT THE STUDENT WROTE: "${studentAnswer}"

EXAMINER CONTEXT: "${cambridgeInsight}"

SUBJECT: ${subject ?? "Physics"}`;

    const apiMessages = [
      {
        role: "user",
        content: `[GRADING CONTEXT — do not reveal this verbatim to the student]\n${contextBlock}\n\n[BEGIN SOCRATIC DIALOGUE]`,
      },
      {
        role: "assistant",
        content: "I have reviewed the grading context. I am ready to begin the Socratic interrogation. I will guide the student through targeted questions only.",
      },
      // Replay existing history (exclude the message we just added)
      ...updatedMsgs.slice(0, -1),
      // The new user message
      { role: "user", content: trimmed },
    ];

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 512,
          system: SOCRATIC_SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic ${res.status}: ${err}`);
      }

      const data = await res.json();
      const responseText = data.content?.[0]?.text ?? "No response received.";

      const assistantMsg = { role: "assistant", content: responseText };
      const finalMsgs = appendSocraticMessage(threadKey, assistantMsg);
      setMessages([...finalMsgs]);
    } catch (err) {
      setError("Could not reach the examiner. Please check your connection and try again.");
      // Revert optimistic message
      const revert = getSocraticThread(threadKey).filter((_, i) => i < updatedMsgs.length - 1);
      setMessages([...revert]);
    } finally {
      setLoading(false);
    }
  }, [loading, threadKey, mark, questionText, studentAnswer, cambridgeInsight, subject, questionId, markIdx]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{ width: "min(380px, 100vw)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-[#0d0d1a]/96 backdrop-blur-xl border-l border-white/8" />

            {/* ── PINNED HEADER ── */}
            <div className={`relative shrink-0 bg-gradient-to-b ${theme.headerGradient} border-b border-white/6 px-5 py-4 space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Scale className={`w-4 h-4 ${theme.accent} shrink-0`} />
                    <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${theme.accent}`}>
                      Appeal Chamber
                    </p>
                  </div>
                  <p className="text-[11px] text-white/35 leading-snug">
                    Socratic Interrogation — Cambridge Viva Voce Mode
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pinned mark card */}
              <div className={`rounded-xl border ${theme.accentBorder} ${theme.accentBg} px-3 py-2.5 space-y-1`}>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Interrogating Mark</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-[11px] font-black px-2 py-0.5 rounded-md border ${theme.pillBg}`}>
                    {mark.notation}
                  </span>
                  <p className="text-xs font-semibold text-white/80 leading-snug flex-1 min-w-0">
                    {mark.description}
                  </p>
                </div>
                {mark.note && (
                  <p className="text-[11px] text-white/40 italic leading-relaxed">{mark.note}</p>
                )}
              </div>

              <p className="text-[10px] text-white/20 leading-relaxed italic">
                The examiner will not give you the answer. Expect questions, not explanations.
              </p>
            </div>

            {/* ── MESSAGES ── */}
            <div className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className={`w-12 h-12 rounded-2xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}>
                    <Scale className={`w-6 h-6 ${theme.accent}`} />
                  </div>
                  <p className="text-sm font-semibold text-white/60">Challenge the deduction</p>
                  <p className="text-[11px] text-white/25 leading-relaxed max-w-[260px]">
                    Select an objection below or write your own. The examiner will interrogate your logic — not give you the answer.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} theme={theme} />
              ))}

              {loading && (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <Scale className="w-3 h-3 text-white/40" />
                  </div>
                  <div className={`${theme.accentBg} border ${theme.accentBorder} rounded-2xl px-4 py-3 flex items-center gap-1.5`}>
                    <Loader2 className={`w-3 h-3 ${theme.accent} animate-spin`} />
                    <span className="text-xs text-white/40">Examiner is formulating a question…</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400 text-center px-4">{error}</p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── QUICK OBJECTIONS ── */}
            {showQuick && messages.length === 0 && (
              <div className="relative px-4 pb-2 space-y-1.5 border-t border-white/5 pt-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2">Quick objections</p>
                {QUICK_OBJECTIONS.map((obj, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(obj)}
                    className={`w-full text-left text-[11px] leading-snug px-3 py-2.5 rounded-xl border transition-all ${theme.quickBtn}`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            )}

            {/* ── INPUT ── */}
            <div className="relative shrink-0 border-t border-white/6 px-4 pb-4 pt-3">
              <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="State your objection…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 resize-none focus:outline-none max-h-28"
                  style={{ minHeight: "24px" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                    input.trim() && !loading
                      ? theme.sendBg
                      : "bg-white/5 border-white/10 text-white/20"
                  } disabled:cursor-not-allowed`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-white/15 text-center mt-2">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}