import { useState, useEffect } from "react";
import { Pencil, Check, X, StickyNote } from "lucide-react";
import { getNote, saveNote } from "@/lib/questionNotesStore";
import RichNoteInput, { hasContent } from "@/components/RichNoteInput";

/** Renders note text — handles both legacy plain text and new HTML notes */
function NoteDisplay({ text, className }) {
  if (!text) return null;
  const isHtml = /<[a-z][^>]*>/i.test(text);
  if (isHtml) {
    return (
      <div
        className={`[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline ${className}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return <p className={`whitespace-pre-wrap ${className}`}>{text}</p>;
}

export default function QuestionNoteWidget({ questionId, topic, questionText }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState(null);

  // Reset completely when the question changes
  useEffect(() => {
    const note = getNote(questionId);
    setExisting(note);
    setText(note?.text ?? "");
    setOpen(false);
    setSaved(false);
  }, [questionId]);

  function handleSave() {
    saveNote(questionId, text, { topic, questionText: (questionText ?? "").slice(0, 200) });
    const updated = getNote(questionId);
    setExisting(updated);
    setSaved(true);
    if (!hasContent(text)) setOpen(false);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    saveNote(questionId, "");
    setExisting(null);
    setText("");
    setSaved(false);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
    if (e.key === "Escape") setOpen(false);
  }

  // Compact closed state with note preview
  if (!open && !hasContent(existing?.text)) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all text-left bg-secondary/40 border-border/40 text-muted-foreground/50 hover:text-foreground/70 hover:border-border hover:bg-secondary/60"
      >
        <StickyNote className="w-3.5 h-3.5 shrink-0" />
        <span>Add a note for this question…</span>
      </button>
    );
  }

  if (!open && hasContent(existing?.text)) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all text-left bg-amber-500/8 border-amber-500/20 text-amber-300/80 hover:bg-amber-500/12"
      >
        <StickyNote className="w-3.5 h-3.5 shrink-0" />
        <NoteDisplay text={existing.text} className="truncate flex-1 text-xs text-amber-300/80" />
        <Pencil className="w-3 h-3 shrink-0 opacity-50" />
      </button>
    );
  }

  // Expanded editor
  return (
    <div className="bg-amber-500/6 border border-amber-500/20 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2">
          <StickyNote className="w-3.5 h-3.5 text-amber-400/70" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">My Note</p>
        </div>
        <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-amber-500/15 text-amber-400/50 hover:text-amber-400 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-2" onKeyDown={handleKeyDown}>
        <RichNoteInput
          key={questionId}
          value={text}
          onChange={setText}
          placeholder="What helped you understand this? What keeps tripping you up?"
          minRows={3}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasContent(existing?.text) && (
              <button onClick={handleDelete} className="text-[11px] text-red-400/50 hover:text-red-400 transition-colors">
                Delete note
              </button>
            )}
            <p className="text-[10px] text-muted-foreground/30">⌘/Ctrl+Enter to save</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasContent(text) && !hasContent(existing?.text)}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:brightness-110 transition-all bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? <><Check className="w-3 h-3" /> Saved</> : "Save note"}
          </button>
        </div>
      </div>
    </div>
  );
}