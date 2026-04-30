/**
 * MarkdownText — renders question text with basic markdown formatting.
 * Handles: **bold**, `inline code`, ``` code blocks ```, pipe tables, newlines.
 * Never shows raw markdown syntax to the student.
 */

// ─── Parse markdown tables ──────────────────────────────────────────────────
function parseMarkdownTables(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const segments = [];
  let i = 0;
  const isTableLine = (l) => l.trim().startsWith("|") && l.trim().endsWith("|");
  while (i < lines.length) {
    if (isTableLine(lines[i])) {
      const tableLines = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i].trim());
        i++;
      }
      segments.push({ type: "table", lines: tableLines });
    } else {
      const textLines = [];
      while (i < lines.length && !isTableLine(lines[i])) {
        textLines.push(lines[i]);
        i++;
      }
      const joined = textLines.join("\n").trim();
      if (joined) segments.push({ type: "text", content: joined });
    }
  }
  return segments;
}

function parseTableLines(tableLines) {
  const isSep = (row) => row.every(c => /^[-: ]+$/.test(c.trim()));
  const splitRow = (line) => line.slice(1, -1).split("|").map(c => c.trim());
  const rows = tableLines.map(splitRow);
  if (rows.length < 2) return null;
  const header = rows[0];
  const body = rows.slice(1).filter(r => !isSep(r));
  return { header, body };
}

function RenderedTable({ lines }) {
  const parsed = parseTableLines(lines);
  if (!parsed) return null;
  const { header, body } = parsed;
  return (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "auto", fontSize: 14 }}>
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i} style={{ border: "1px solid #aaa", padding: "6px 14px", background: "rgba(255,255,255,0.08)", fontWeight: 600, textAlign: "center" }}>
                <InlineText text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ border: "1px solid #aaa", padding: "6px 14px", textAlign: "center" }}>
                  <InlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Inline renderer: **bold**, *italic*, `code`, $$math$$ ────────────────
function InlineText({ text }) {
  if (!text) return null;
  const parts = [];
  // Order: $$math$$, **bold**, *italic*, `code`
  const regex = /(\$\$(.+?)\$\$|\*\*(.+?)\*\*|\*([^*]+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    if (match[0].startsWith("$$")) {
      parts.push({ type: "math", content: match[2] });
    } else if (match[0].startsWith("**")) {
      parts.push({ type: "bold", content: match[3] });
    } else if (match[0].startsWith("*")) {
      parts.push({ type: "italic", content: match[4] });
    } else {
      parts.push({ type: "code", content: match[5] });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === "bold") return <strong key={i}>{p.content}</strong>;
        if (p.type === "italic") return <em key={i}>{p.content}</em>;
        if (p.type === "math") return (
          <span key={i} style={{ fontFamily: "serif", fontStyle: "italic", letterSpacing: "0.02em", padding: "0 2px" }}>
            {p.content}
          </span>
        );
        if (p.type === "code") return (
          <code key={i} style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4, fontSize: "0.9em" }}>
            {p.content}
          </code>
        );
        return <span key={i}>{p.content}</span>;
      })}
    </>
  );
}

// ─── Block text renderer: handles code blocks and paragraphs ───────────────
function TextBlock({ content }) {
  // Handle ``` code blocks
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  const parts = [];
  let last = 0;
  let match;
  while ((match = codeBlockRe.exec(content)) !== null) {
    if (match.index > last) {
      parts.push({ type: "prose", content: content.slice(last, match.index) });
    }
    parts.push({ type: "codeblock", lang: match[1], content: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push({ type: "prose", content: content.slice(last) });

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === "codeblock") {
          return (
            <pre key={i} style={{
              fontFamily: "monospace",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              overflowX: "auto",
              margin: "8px 0",
              whiteSpace: "pre",
            }}>
              <code>{p.content}</code>
            </pre>
          );
        }
        // Prose: split into lines, render each with InlineText
        const lines = p.content.split("\n");
        const result = [];
        let i2 = 0;
        while (i2 < lines.length) {
          const line = lines[i2];
          if (!line.trim()) { result.push(<br key={`br-${i2}`} />); i2++; continue; }
          result.push(
            <span key={`l-${i2}`} style={{ display: "block" }}>
              <InlineText text={line} />
            </span>
          );
          i2++;
        }
        return <span key={i}>{result}</span>;
      })}
    </>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export default function MarkdownText({ text, className }) {
  if (!text) return null;
  const segments = parseMarkdownTables(text);
  return (
    <div className={className} style={{ lineHeight: 1.65 }}>
      {segments.map((seg, i) =>
        seg.type === "table"
          ? <RenderedTable key={i} lines={seg.lines} />
          : <TextBlock key={i} content={seg.content} />
      )}
    </div>
  );
}