/**
 * TutorChat — full-screen chat interface for a specific AI tutor agent.
 * Route: /ai-tutors/:agentId
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, PanelRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { TUTOR_MAP } from "@/lib/tutorConfig";
import TutorDrawer from "@/components/TutorDrawer";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isThinking =
    message.role === "assistant" &&
    !message.content &&
    (!message.tool_calls || message.tool_calls.length === 0);

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-white/10 text-white"
            : "bg-white/5 border border-white/8 text-white/85"
        }`}
      >
        {isThinking ? (
          <span className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          <ReactMarkdown
            className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              code: ({ inline, children }) =>
                inline ? (
                  <code className="px-1 py-0.5 rounded bg-white/10 text-xs">{children}</code>
                ) : (
                  <pre className="bg-white/5 rounded-lg p-3 overflow-x-auto my-2 text-xs">
                    <code>{children}</code>
                  </pre>
                ),
            }}
          >
            {message.content || ""}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function TutorChat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const meta = TUTOR_MAP[agentId];

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bottomRef = useRef(null);

  // Create a new conversation whenever agentId changes
  useEffect(() => {
    if (!meta) return;
    setLoading(true);
    setMessages([]);
    setConversation(null);
    base44.agents.createConversation({ agent_name: agentId }).then((conv) => {
      setConversation(conv);
      setLoading(false);
    });
  }, [agentId]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages ?? []);
    });
    return unsub;
  }, [conversation?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending || !conversation) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text, id: "optimistic" }]);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <p className="text-white/40 text-sm">Tutor not found.</p>
      </div>
    );
  }

  const { name, subtitle, Icon, iconColor, chatBg, chatBorder, placeholder } = meta;

  return (
    <div className="flex flex-col h-screen bg-[#0d0d1a] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0d0d1a]/95 backdrop-blur shrink-0">
        <button
          onClick={() => navigate("/ai-tutors")}
          className="p-1.5 -ml-1.5 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>

        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${chatBg} ${chatBorder}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">{name}</p>
          <p className={`text-[10px] ${iconColor} leading-none`}>{subtitle}</p>
        </div>

        {/* My Tutors drawer toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white text-xs font-medium"
        >
          <PanelRight className="w-3.5 h-3.5" />
          <span>My Tutors</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${chatBg} ${chatBorder}`}>
              <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <p className="text-white font-bold">{name}</p>
            <p className="text-white/40 text-sm max-w-[260px] leading-relaxed">
              {placeholder.replace("...", ".")} Type a question below to get started.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={msg.id ?? i} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/5">
        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={loading || sending}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none focus:outline-none max-h-32"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || loading}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !sending && !loading
                ? `${chatBg} ${iconColor} hover:brightness-125`
                : "bg-white/5 text-white/20"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-2">
          AI can make mistakes — verify with official Cambridge resources.
        </p>
      </div>

      {/* Side drawer */}
      <TutorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeId={agentId}
      />
    </div>
  );
}