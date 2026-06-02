import { useRef, useEffect } from "react";

/** Strip HTML tags — used for empty checks and plain-text comparisons */
export function hasContent(html) {
  return !!(html || "").replace(/<[^>]*>/g, "").trim();
}

/**
 * RichNoteInput — contentEditable area with B / I / U formatting toolbar.
 * Supports Ctrl+B, Ctrl+I, Ctrl+U keyboard shortcuts.
 * Stores and emits HTML string via onChange.
 */
export default function RichNoteInput({
  value = "",
  onChange,
  placeholder = "Write a note...",
  minRows = 3,
  autoFocus = false,
  className = "",
}) {
  const ref = useRef(null);
  const lastHtml = useRef(value);
  const composing = useRef(false);

  // ── Mount: set initial content ───────────────────────────────────────────
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value || "";
    lastHtml.current = value || "";
    if (autoFocus) {
      ref.current.focus();
      // Move cursor to end
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── External value change (e.g. question changed via key prop) ───────────
  useEffect(() => {
    if (!ref.current) return;
    if (value !== lastHtml.current) {
      ref.current.innerHTML = value || "";
      lastHtml.current = value || "";
    }
  }, [value]);

  // ── Emit current innerHTML ───────────────────────────────────────────────
  function emit() {
    const html = ref.current?.innerHTML ?? "";
    lastHtml.current = html;
    onChange?.(html);
  }

  // ── Apply a formatting command ───────────────────────────────────────────
  function fmt(cmd) {
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    emit();
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  function onKeyDown(e) {
    if (e.metaKey || e.ctrlKey) {
      const k = e.key.toLowerCase();
      if (k === "b") { e.preventDefault(); fmt("bold"); }
      else if (k === "i") { e.preventDefault(); fmt("italic"); }
      else if (k === "u") { e.preventDefault(); fmt("underline"); }
    }
  }

  const empty = !hasContent(value);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-0.5">
        {[
          { cmd: "bold",      label: "B", extra: "font-bold",  title: "Bold · Ctrl+B" },
          { cmd: "italic",    label: "I", extra: "italic",      title: "Italic · Ctrl+I" },
          { cmd: "underline", label: "U", extra: "underline",   title: "Underline · Ctrl+U" },
        ].map(({ cmd, label, extra, title }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
            className={`min-w-[28px] h-7 px-2 rounded-lg text-xs flex items-center justify-center
              text-muted-foreground/60 hover:text-foreground hover:bg-secondary
              transition-colors select-none ${extra}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground/25 pr-0.5 select-none">
          Ctrl+B/I/U
        </span>
      </div>

      {/* Editable area */}
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={() => { if (!composing.current) emit(); }}
          onKeyDown={onKeyDown}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={() => { composing.current = false; emit(); }}
          style={{ minHeight: `${minRows * 1.55}em` }}
          className="w-full bg-card border border-border/60 rounded-lg px-3 py-2.5 text-sm
            text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30
            transition-all break-words overflow-auto
            [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
        />
        {empty && (
          <p className="absolute top-2.5 left-3 text-sm text-muted-foreground/40 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}