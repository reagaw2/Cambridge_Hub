import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Zap, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const DEV_EMAIL = "reaganmungoma@gmail.com";

const SUBJECT_OPTIONS = [
  { value: "physics", label: "Physics (9702)" },
  { value: "cs", label: "Computer Science (9618)" },
];

const SYLLABUS_TOPICS = {
  physics: [
    "Physical Quantities & Units", "Kinematics", "Forces & Equilibrium",
    "Momentum", "Work, Energy & Power", "Deformation of Solids", "Waves",
    "Circular Motion", "Gravitational Fields", "Thermal Physics", "Oscillations",
    "Electric Fields", "Capacitance", "Magnetic Fields", "Electromagnetic Induction",
    "Alternating Currents", "Quantum Physics", "Nuclear Physics",
    "Medical Imaging", "Astrophysics",
  ],
  cs: [
    "Data Representation", "Compression", "Computers and Components",
    "Operating Systems", "Language Translators", "Ethics and Ownership",
    "Networks and the Internet", "Data Security", "Data Integrity",
    "Databases", "Algorithm Design", "Data Types and Structures",
    "Programming Paradigms", "Artificial Intelligence",
  ],
};

function topicToKey(topic) {
  return topic.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function buildQuestionId(code, session, variant, qNum) {
  const prefix = code === "9702" ? "PHYS" : "CS";
  return `${prefix}-${code}-${session}-${variant}-Q${String(qNum).padStart(2, "0")}`;
}

/**
 * Multi-strategy Cambridge question splitter.
 * Tries several patterns in order of reliability.
 */
function splitByQuestions(text) {
  // Strategy 1: Explicit "Question N" header
  {
    const regex = /(?:^|\n)\s*Question\s+(\d{1,2})\b/gm;
    const matches = [...text.matchAll(regex)];
    if (matches.length >= 2) {
      return matches.map((m, i) => {
        const start = m.index + m[0].length;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        return { num: parseInt(m[1], 10), text: text.slice(start, end).trim() };
      }).filter(q => q.text.length > 30);
    }
  }

  // Strategy 2: Cambridge mark allocation pattern — "1  [N]" or "1\n...\n[N]"
  // Looks for lines that are just a question number followed shortly by [marks]
  {
    const regex = /(?:^|\n)[ \t]*(\d{1,2})[ \t]*\n(?:[\s\S]{0,500}?)(?=\n[ \t]*\d{1,2}[ \t]*\n|\n[ \t]*\d{1,2}[ \t]*\[|$)/gm;
    const matches = [...text.matchAll(regex)];
    if (matches.length >= 2) {
      const parts = [];
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + matches[i][0].length - (matches[i][0].match(/\n\s*$/) ? matches[i][0].match(/\n\s*$/)[0].length : 0);
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const qText = text.slice(start, end).trim();
        if (qText.length > 30) parts.push({ num: parseInt(matches[i][1], 10), text: qText });
      }
      if (parts.length >= 2) return parts;
    }
  }

  // Strategy 3: Lines that are ONLY a digit (standalone question number)
  {
    const lines = text.split("\n");
    const questionStarts = [];
    lines.forEach((line, idx) => {
      if (/^\s*(\d{1,2})\s*$/.test(line.trim())) {
        const num = parseInt(line.trim(), 10);
        if (num >= 1 && num <= 20) questionStarts.push({ num, lineIdx: idx });
      }
    });
    if (questionStarts.length >= 2) {
      return questionStarts.map((qs, i) => {
        const startLine = qs.lineIdx + 1;
        const endLine = i + 1 < questionStarts.length ? questionStarts[i + 1].lineIdx : lines.length;
        const qText = lines.slice(startLine, endLine).join("\n").trim();
        return { num: qs.num, text: qText };
      }).filter(q => q.text.length > 30);
    }
  }

  // Strategy 4: Split on [N marks] or [N] annotations — Cambridge papers put these at question ends
  // Find positions of "\n1 " "\n2 " etc. that appear before content and mark allocations
  {
    const regex = /\n(\d{1,2})\s+(?=[A-Z(])/g;
    const matches = [...text.matchAll(regex)];
    if (matches.length >= 2) {
      const parts = [];
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + matches[i][0].length - 1;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const qText = text.slice(start, end).trim();
        if (qText.length > 30) parts.push({ num: parseInt(matches[i][1], 10), text: qText });
      }
      if (parts.length >= 2) return parts;
    }
  }

  // Strategy 5: AI-assisted — let the AI split it (pass entire text as one block for AI to handle)
  // Return the whole paper as Q1 and let the AI figure out the structure
  if (text.trim().length > 50) {
    return [{ num: 1, text: text.trim(), requiresAISplit: true }];
  }

  return [];
}

function splitMarkSchemeByQuestion(msText, questionNums) {
  const result = {};
  for (const qNum of questionNums) {
    const patterns = [
      new RegExp(`Question\\s+${qNum}\\b([\\s\\S]*?)(?=Question\\s+${qNum + 1}\\b|$)`, "i"),
      new RegExp(`(?:^|\\n)\\s*${qNum}\\s*\\n([\\s\\S]*?)(?=(?:^|\\n)\\s*${qNum + 1}\\s*\\n|$)`, "i"),
    ];
    for (const p of patterns) {
      const m = msText.match(p);
      if (m) { result[qNum] = m[1].trim(); break; }
    }
    if (!result[qNum]) result[qNum] = "";
  }
  return result;
}

async function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bytes = new Uint8Array(e.target.result);
        const latin1 = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
        const lines = [];

        const btEtRegex = /BT([\s\S]*?)ET/g;
        let match;
        while ((match = btEtRegex.exec(latin1)) !== null) {
          const block = match[1];
          const chunks = [];
          const tjRegex = /\(([^)]*)\)\s*(?:Tj|')/g;
          let m;
          while ((m = tjRegex.exec(block)) !== null) {
            chunks.push(m[1].replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\"));
          }
          const tjArrRegex = /\[([^\]]*)\]\s*TJ/g;
          while ((m = tjArrRegex.exec(block)) !== null) {
            const strRegex = /\(([^)]*)\)/g;
            let sm;
            while ((sm = strRegex.exec(m[1])) !== null) chunks.push(sm[1]);
          }
          if (chunks.length > 0) lines.push(chunks.join(" ").trim());
        }

        let extracted = lines.join("\n");

        if (extracted.length < 200) {
          const plain = latin1.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s{3,}/g, "\n");
          extracted = plain.split("\n").map(l => l.trim()).filter(l => l.length > 4 && /[a-zA-Z]{2,}/.test(l)).join("\n");
        }

        if (extracted.length < 50) {
          reject(new Error(`"${file.name}" appears to be a scanned/image PDF. Switch to Paste Text mode.`));
          return;
        }

        resolve(extracted.replace(/\n{3,}/g, "\n\n").trim());
      } catch (err) {
        reject(new Error(`Failed to parse "${file.name}": ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error(`Could not read "${file.name}"`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * If splitByQuestions returns requiresAISplit=true, ask Claude to split the paper.
 */
async function aiSplitPaper(fullText, subject, anthropicKey) {
  const prompt = `You are a Cambridge A Level examiner. The following is the extracted text from a Cambridge ${subject === "physics" ? "Physics (9702)" : "Computer Science (9618)"} exam paper.

Split this into individual top-level questions. For each question, return:
- The question number (integer)
- The full text of that question including all sub-parts

PAPER TEXT:
${fullText.slice(0, 6000)}

Respond ONLY in this JSON format:
{
  "questions": [
    { "num": 1, "text": "full question 1 text including sub-parts" },
    { "num": 2, "text": "full question 2 text including sub-parts" }
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json();
  let text = data.content?.[0]?.text ?? "{}";
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) text = jsonMatch[1].trim();
  const parsed = JSON.parse(text);
  return (parsed.questions ?? []).filter(q => q.text?.trim().length > 30);
}

async function classifyAndGenerateNodes(questionText, markSchemeText, subject, anthropicKey) {
  const topicList = SYLLABUS_TOPICS[subject].join(", ");
  const prompt = `You are an expert Cambridge ${subject === "physics" ? "A Level Physics (9702)" : "A Level Computer Science (9618)"} examiner.

QUESTION TEXT:
${questionText.slice(0, 1500)}

MARK SCHEME:
${(markSchemeText || "(not available)").slice(0, 1500)}

AVAILABLE TOPICS: ${topicList}

Respond ONLY in this JSON format — no extra text:
{
  "topics": ["1-3 matching topics from the available list"],
  "total_marks": <integer>,
  "difficulty": "easy" | "medium" | "hard",
  "nodes": [
    {
      "node_index": 0,
      "mark_type": "B1",
      "keyword": "exact phrase student must include",
      "aliases": ["alternative phrasings"],
      "is_mandatory": false,
      "dependent_on": null,
      "max_marks": 1
    }
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  let text = data.content?.[0]?.text ?? "{}";
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) text = jsonMatch[1].trim();
  return JSON.parse(text);
}

async function upsertToSupabase(supabaseUrl, serviceKey, table, row) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok && res.status !== 409) {
    const err = await res.text();
    throw new Error(`Supabase [${table}]: ${err}`);
  }
}

async function deleteFromSupabase(supabaseUrl, serviceKey, table, filter) {
  await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
  });
}

function FileDropZone({ label, accept, file, onFile, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
        dragging ? "border-primary bg-primary/10"
          : file ? "border-green-500/50 bg-green-500/5"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-white truncate max-w-[240px]">{file.name}</p>
            <p className="text-[11px] text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Upload className="w-6 h-6 text-white/30 mx-auto" />
          <p className="text-sm font-semibold text-white/60">{label}</p>
          <p className="text-[11px] text-white/25">{hint}</p>
        </div>
      )}
    </div>
  );
}

function ResultRow({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-all">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Q{r.qNum} — {r.topics?.[0] ?? "Unknown"}</p>
            <p className="text-[11px] text-white/40">{r.questionId} · {r.totalMarks} marks · {r.nodeCount} nodes</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/25" /> : <ChevronDown className="w-4 h-4 text-white/25" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-white/5 pt-2 space-y-1">
          <p className="text-[11px] text-white/50">Topics: <span className="text-white/70">{r.topics?.join(", ")}</span></p>
          <p className="text-[11px] text-white/50">Nodes: <span className="text-white/70">{r.nodeCount}</span></p>
          <p className="text-[11px] text-white/50">Marks: <span className="text-white/70">{r.totalMarks}</span></p>
        </div>
      )}
    </div>
  );
}

export default function BulkPaperIngestor() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject] = useState("physics");
  const [qpFile, setQpFile] = useState(null);
  const [msFile, setMsFile] = useState(null);
  const [paperCode, setPaperCode] = useState("9702");
  const [paperSession, setPaperSession] = useState("MJS25");
  const [paperVariant, setPaperVariant] = useState("42");
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? "");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY ?? "");
  const [phase, setPhase] = useState("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState([]);
  const [useManualText, setUseManualText] = useState(false);
  const [qpText, setQpText] = useState("");
  const [msText, setMsText] = useState("");
  const [extractedPreview, setExtractedPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (user?.email !== DEV_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <p className="text-sm text-white/30">Access restricted.</p>
      </div>
    );
  }

  function addLog(msg) {
    setLogs(prev => [...prev, msg]);
  }

  async function handlePreview() {
    if (!qpFile) return;
    try {
      const text = await extractTextFromFile(qpFile);
      setExtractedPreview(text);
      setShowPreview(true);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleRun() {
    if (!supabaseUrl || !supabaseServiceKey) { setErrorMsg("Please provide Supabase URL and Service Role key."); return; }
    if (!anthropicKey) { setErrorMsg("Please provide your Anthropic API key."); return; }
    if (!paperCode.trim() || !paperSession.trim() || !paperVariant.trim()) { setErrorMsg("Please fill in Paper Code, Session and Variant."); return; }

    setPhase("running");
    setErrorMsg("");
    setResult(null);
    setLogs([]);
    setShowPreview(false);

    const code = paperCode.trim().toUpperCase();
    const session = paperSession.trim().toUpperCase();
    const variant = paperVariant.trim();

    try {
      let qpExtracted = qpText;
      let msExtracted = msText;

      if (!useManualText) {
        if (!qpFile) { setErrorMsg("Please upload a Question Paper PDF."); setPhase("idle"); return; }
        setProgressMsg("Extracting text from Question Paper PDF…"); setProgressPct(10);
        addLog("📄 Extracting question paper text...");
        qpExtracted = await extractTextFromFile(qpFile);
        addLog(`✓ Extracted ${qpExtracted.length} chars from question paper`);

        if (msFile) {
          setProgressMsg("Extracting text from Mark Scheme PDF…"); setProgressPct(15);
          addLog("📄 Extracting mark scheme text...");
          msExtracted = await extractTextFromFile(msFile);
          addLog(`✓ Extracted ${msExtracted.length} chars from mark scheme`);
        }
      }

      if (!qpExtracted?.trim()) { setErrorMsg("No text found. Switch to Paste Text mode."); setPhase("error"); return; }

      addLog(`📋 Paper: ${code}/${variant} · ${session}`);

      // Try to split using pattern matching first
      setProgressMsg("Splitting paper into questions…"); setProgressPct(20);
      let questions = splitByQuestions(qpExtracted);

      // If only 1 result with requiresAISplit, use AI to split
      if (questions.length === 1 && questions[0].requiresAISplit) {
        addLog("⚠️ Could not detect question boundaries — using AI to split paper…");
        setProgressMsg("AI splitting paper into questions…"); setProgressPct(25);
        questions = await aiSplitPaper(qpExtracted, subject, anthropicKey);
        addLog(`✓ AI found ${questions.length} questions`);
      } else {
        addLog(`✓ Split into ${questions.length} question${questions.length !== 1 ? "s" : ""}`);
      }

      if (questions.length === 0) {
        setErrorMsg("Could not split the paper. Try Paste Text mode with clear question numbering.");
        setPhase("error"); return;
      }

      const msChunks = splitMarkSchemeByQuestion(msExtracted ?? "", questions.map(q => q.num));

      const results = [];
      const errors = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = buildQuestionId(code, session, variant, q.num);
        setProgressMsg(`AI classifying Q${q.num} of ${questions.length}…`);
        setProgressPct(30 + Math.round((i / questions.length) * 60));
        addLog(`🤖 Processing Q${q.num} → ${questionId}…`);

        try {
          const msText_q = msChunks[q.num] ?? "";
          const analysis = await classifyAndGenerateNodes(q.text, msText_q, subject, anthropicKey);

          await upsertToSupabase(supabaseUrl, supabaseServiceKey, "questions", {
            id: questionId,
            topic: analysis.topics?.[0] ?? "Unknown",
            topic_key: topicToKey(analysis.topics?.[0] ?? "unknown"),
            subject,
            paper_ref: `${code}/${variant} · ${session}`,
            label: `Question ${q.num}`,
            question_text: q.text.slice(0, 2000),
            total_marks: analysis.total_marks ?? 1,
            difficulty: analysis.difficulty ?? "medium",
            mark_scheme_text: msText_q.slice(0, 3000),
          });

          for (const topicName of (analysis.topics ?? [])) {
            const topicKey = topicToKey(topicName);
            await upsertToSupabase(supabaseUrl, supabaseServiceKey, "topics", { key: topicKey, name: topicName, subject });
            await upsertToSupabase(supabaseUrl, supabaseServiceKey, "question_topics", { question_id: questionId, topic_key: topicKey });
          }

          await deleteFromSupabase(supabaseUrl, supabaseServiceKey, "mark_scheme_nodes", `question_id=eq.${questionId}`);
          if (analysis.nodes?.length > 0) {
            await upsertToSupabase(supabaseUrl, supabaseServiceKey, "mark_scheme_nodes",
              analysis.nodes.map(n => ({ ...n, question_id: questionId })));
          }

          results.push({ questionId, qNum: q.num, topics: analysis.topics ?? [], nodeCount: analysis.nodes?.length ?? 0, totalMarks: analysis.total_marks ?? 1 });
          addLog(`✓ Q${q.num}: ${(analysis.topics ?? []).join(", ")} | ${analysis.nodes?.length ?? 0} nodes`);

          if (i < questions.length - 1) await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          errors.push({ qNum: q.num, error: err.message });
          addLog(`✗ Q${q.num} failed: ${err.message}`);
        }
      }

      setProgressMsg("Done!"); setProgressPct(100);
      setResult({ paperId: `${code}/${variant}/${session}`, questionsFound: questions.length, questionsProcessed: results.length, errors, results });
      setPhase("done");
    } catch (err) {
      setErrorMsg(err.message ?? String(err));
      setPhase("error");
    }
  }

  const isRunning = phase === "running";

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Bulk Paper Ingestor</span>
          </div>
          <span className="text-[10px] text-amber-400/60 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6 pb-10">

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white">Zero-friction Paper Splitter</h1>
            <p className="text-xs text-white/40 leading-relaxed">
              Upload any Question Paper + Mark Scheme PDF. Fill in the paper details. AI splits, classifies, and seeds mark scheme nodes into Supabase.
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Subject</p>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECT_OPTIONS.map(s => (
                <button key={s.value} onClick={() => setSubject(s.value)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    subject === s.value ? "bg-amber-500/15 border-amber-500/40 text-amber-300" : "bg-white/[0.03] border-white/8 text-white/40 hover:border-white/15"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paper metadata */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Paper Details</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-white/30">Code</label>
                <input value={paperCode} onChange={e => setPaperCode(e.target.value)} placeholder="9702"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/30">Session</label>
                <input value={paperSession} onChange={e => setPaperSession(e.target.value)} placeholder="MJS25"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/30">Variant</label>
                <input value={paperVariant} onChange={e => setPaperVariant(e.target.value)} placeholder="42"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              </div>
            </div>
            <p className="text-[10px] text-white/20">Session: MJ=May/Jun, ON=Oct/Nov, FM=Feb/Mar + year (e.g. MJS25, ONW24)</p>
          </div>

          {/* Input mode toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setUseManualText(false)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${!useManualText ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/8 text-white/30"}`}>
              📄 Upload PDFs
            </button>
            <button onClick={() => setUseManualText(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${useManualText ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/8 text-white/30"}`}>
              ✍️ Paste Text
            </button>
          </div>

          {!useManualText ? (
            <div className="space-y-3">
              <FileDropZone label="Question Paper PDF" accept=".pdf" file={qpFile} onFile={(f) => { setQpFile(f); setExtractedPreview(null); }}
                hint="Any filename works — fill in Paper Details above" />
              {qpFile && (
                <button onClick={handlePreview}
                  className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:brightness-110 transition-all">
                  <Eye className="w-3.5 h-3.5" /> Preview extracted text (check before ingesting)
                </button>
              )}
              <FileDropZone label="Mark Scheme PDF (recommended)" accept=".pdf" file={msFile} onFile={setMsFile}
                hint="Provides mark scheme text for each question" />
            </div>
          ) : (
            <div className="space-y-3">
              <textarea value={qpText} onChange={e => setQpText(e.target.value)}
                placeholder="Paste question paper text. Put each question on a new line starting with its number, e.g.&#10;&#10;1&#10;State what is meant by...&#10;&#10;2&#10;Explain how..."
                rows={8}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono" />
              <textarea value={msText} onChange={e => setMsText(e.target.value)}
                placeholder="Paste mark scheme text (optional)…" rows={5}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono" />
            </div>
          )}

          {/* Extracted text preview */}
          {showPreview && extractedPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Extracted Text Preview</p>
                <button onClick={() => setShowPreview(false)} className="text-[10px] text-white/30 hover:text-white/60">Hide</button>
              </div>
              <pre className="bg-black/40 border border-white/8 rounded-xl p-3 text-[11px] font-mono text-white/60 max-h-60 overflow-y-auto whitespace-pre-wrap break-words">
                {extractedPreview}
              </pre>
              <p className="text-[11px] text-amber-400/70">
                ⚠️ If you don't see clear question boundaries, switch to Paste Text mode and format the text with each question number on its own line.
              </p>
            </div>
          )}

          {/* Credentials */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Credentials</p>
            <input value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="Supabase URL (https://xxx.supabase.co)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
            <input value={supabaseServiceKey} onChange={e => setSupabaseServiceKey(e.target.value)}
              placeholder="Supabase service_role key (eyJ…)"
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
            <input value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)}
              placeholder="Anthropic API Key (sk-ant-…)"
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <p className="text-sm text-amber-300 font-semibold">{progressMsg}</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {/* Live logs */}
          {logs.length > 0 && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 max-h-52 overflow-y-auto space-y-0.5">
              {logs.map((l, i) => (
                <p key={i} className="text-[11px] font-mono text-white/50 leading-relaxed">{l}</p>
              ))}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/8 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Results */}
          {phase === "done" && result && (
            <div className="space-y-3">
              <div className="bg-green-500/8 border border-green-500/25 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <p className="font-bold text-white">Ingestion Complete — {result.paperId}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[["Found", result.questionsFound], ["Seeded", result.questionsProcessed], ["Errors", result.errors?.length ?? 0]].map(([label, val]) => (
                    <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-white">{val}</p>
                      <p className="text-[10px] text-white/35">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Errors</p>
                  {result.errors.map((e, i) => (
                    <div key={i} className="bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                      <p className="text-xs text-red-300">Q{e.qNum}: {e.error}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Questions seeded</p>
                {result.results?.map(r => <ResultRow key={r.questionId} r={r} />)}
              </div>
            </div>
          )}

          {/* Run button */}
          <button onClick={handleRun}
            disabled={isRunning || (!qpFile && !qpText.trim())}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isRunning
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : phase === "done"
                ? <><Zap className="w-4 h-4" /> Run Again</>
                : <><Zap className="w-4 h-4" /> Split, Classify & Ingest</>}
          </button>

          <details className="group">
            <summary className="text-[11px] text-white/25 cursor-pointer hover:text-white/40 list-none flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              View required SQL migration
            </summary>
            <pre className="mt-3 bg-white/[0.03] border border-white/8 rounded-xl p-4 text-[10px] font-mono text-white/50 overflow-x-auto whitespace-pre leading-relaxed">
{`ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS mark_scheme_text text;

CREATE TABLE IF NOT EXISTS topics (
  key     text PRIMARY KEY,
  name    text NOT NULL,
  subject text NOT NULL DEFAULT 'physics'
);

CREATE TABLE IF NOT EXISTS question_topics (
  question_id text REFERENCES questions(id) ON DELETE CASCADE,
  topic_key   text REFERENCES topics(key)   ON DELETE CASCADE,
  PRIMARY KEY (question_id, topic_key)
);`}
            </pre>
          </details>

        </div>
      </div>
    </div>
  );
}