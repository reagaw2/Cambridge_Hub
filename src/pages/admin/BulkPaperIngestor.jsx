import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Zap, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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

function extractPaperMeta(filename) {
  const match = filename.match(/(\d{4})_([a-z]\d{2})_(?:qp|ms)_(\d+)/i);
  if (!match) return null;
  const [, code, sessionRaw, variant] = match;
  const seasonMap = { s: "MJ", m: "FM", w: "ON" };
  const season = seasonMap[sessionRaw[0].toLowerCase()] ?? sessionRaw[0].toUpperCase();
  const year = "20" + sessionRaw.slice(1);
  return { code, session: `${season}${year}`, variant };
}

function buildQuestionId(code, session, variant, qNum) {
  return `${code === "9702" ? "PHYS" : "CS"}-${code}-${session}-${variant}-Q${String(qNum).padStart(2, "0")}`;
}

function splitByQuestions(text) {
  const parts = [];

  // Try "Question 1", "Question 2", etc.
  const regex = /(?:^|\n)\s*Question\s+(\d{1,2})\b/gm;
  const matches = [...text.matchAll(regex)];

  if (matches.length >= 2) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const qText = text.slice(start, end).trim();
      if (qText.length > 30) {
        parts.push({ num: parseInt(matches[i][1], 10), text: qText });
      }
    }
    return parts;
  }

  // Fallback: numbered lines like "1\n", "2\n"
  const numRegex = /(?:^|\n)\s*(\d{1,2})\s*\n/gm;
  const numMatches = [...text.matchAll(numRegex)];
  if (numMatches.length >= 2) {
    for (let i = 0; i < numMatches.length; i++) {
      const start = numMatches[i].index + numMatches[i][0].length;
      const end = i + 1 < numMatches.length ? numMatches[i + 1].index : text.length;
      const qText = text.slice(start, end).trim();
      if (qText.length > 30) {
        parts.push({ num: parseInt(numMatches[i][1], 10), text: qText });
      }
    }
    return parts;
  }

  // Last resort: split every ~500 chars as one question block
  const chunks = text.match(/.{1,2000}/gs) ?? [];
  return chunks.map((t, i) => ({ num: i + 1, text: t.trim() })).filter(q => q.text.length > 30);
}

function splitMarkSchemeByQuestion(msText, questionNums) {
  const result = {};
  for (const qNum of questionNums) {
    const patterns = [
      new RegExp(`Question\\s+${qNum}\\b([\\s\\S]*?)(?=Question\\s+${qNum + 1}\\b|$)`, "i"),
      new RegExp(`\\b${qNum}\\s*\\(a\\)([\\s\\S]*?)(?=\\b${qNum + 1}\\s*\\(a\\)|$)`, "i"),
    ];
    for (const p of patterns) {
      const m = msText.match(p);
      if (m) { result[qNum] = m[1].trim(); break; }
    }
    if (!result[qNum]) result[qNum] = "";
  }
  return result;
}

// Browser-side PDF text extraction using FileReader + pattern matching
async function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const bytes = new Uint8Array(buffer);
        const latin1 = Array.from(bytes).map(b => String.fromCharCode(b)).join("");

        const lines = [];

        // Extract from BT...ET PDF text blocks
        const btEtRegex = /BT([\s\S]*?)ET/g;
        let match;
        while ((match = btEtRegex.exec(latin1)) !== null) {
          const block = match[1];
          const chunks = [];

          // Tj operator
          const tjRegex = /\(([^)]*)\)\s*(?:Tj|')/g;
          let m;
          while ((m = tjRegex.exec(block)) !== null) {
            chunks.push(m[1].replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\"));
          }

          // TJ array
          const tjArrRegex = /\[([^\]]*)\]\s*TJ/g;
          while ((m = tjArrRegex.exec(block)) !== null) {
            const strRegex = /\(([^)]*)\)/g;
            let sm;
            while ((sm = strRegex.exec(m[1])) !== null) {
              chunks.push(sm[1]);
            }
          }

          if (chunks.length > 0) lines.push(chunks.join(" ").trim());
        }

        let extracted = lines.join("\n");

        // Fallback: readable ASCII from raw bytes
        if (extracted.length < 200) {
          const plain = latin1.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s{3,}/g, "\n");
          const readable = plain.split("\n").map(l => l.trim()).filter(l => l.length > 4 && /[a-zA-Z]{2,}/.test(l));
          extracted = readable.join("\n");
        }

        if (extracted.length < 100) {
          reject(new Error(`"${file.name}" appears to be a scanned/image PDF. Please use a text-based PDF from the Cambridge website, or switch to "Paste Text" mode.`));
          return;
        }

        resolve(extracted.replace(/\n{3,}/g, "\n\n").trim());
      } catch (err) {
        reject(new Error(`Failed to parse "${file.name}": ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error(`Could not read file "${file.name}"`));
    reader.readAsArrayBuffer(file);
  });
}

async function classifyAndGenerateNodes(questionText, markSchemeText, subject, anthropicKey, onLog) {
  const topicList = SYLLABUS_TOPICS[subject].join(", ");
  const prompt = `You are an expert Cambridge ${subject === "physics" ? "A Level Physics (9702)" : "A Level Computer Science (9618)"} examiner.

QUESTION TEXT:
${questionText.slice(0, 1500)}

MARK SCHEME:
${(markSchemeText || "(not available)").slice(0, 1500)}

AVAILABLE TOPICS: ${topicList}

Respond ONLY in this JSON format:
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
    throw new Error(`Supabase ${table} error: ${err}`);
  }
}

async function deleteFromSupabase(supabaseUrl, serviceKey, table, filter) {
  await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
    },
  });
}

// ── FileDropZone ────────────────────────────────────────────────────────────
function FileDropZone({ label, accept, file, onFile, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
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
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-white">{file.name}</p>
            <p className="text-[11px] text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="w-7 h-7 text-white/30 mx-auto" />
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

// ── Main component ──────────────────────────────────────────────────────────
export default function BulkPaperIngestor() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject] = useState("physics");
  const [qpFile, setQpFile] = useState(null);
  const [msFile, setMsFile] = useState(null);
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
  const [manualFilename, setManualFilename] = useState("");

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

  async function handleRun() {
    if (!supabaseUrl || !supabaseServiceKey) { setErrorMsg("Please provide Supabase URL and Service Role key."); return; }
    if (!anthropicKey) { setErrorMsg("Please provide your Anthropic API key."); return; }

    setPhase("running");
    setErrorMsg("");
    setResult(null);
    setLogs([]);

    try {
      // 1. Extract text
      let qpExtracted = qpText;
      let msExtracted = msText;
      const filename = useManualText ? manualFilename : (qpFile?.name ?? "");

      if (!useManualText) {
        if (!qpFile) { setErrorMsg("Please upload a Question Paper PDF."); setPhase("idle"); return; }
        setProgressMsg("Extracting text from Question Paper PDF…"); setProgressPct(10);
        addLog("📄 Extracting question paper text...");
        qpExtracted = await extractTextFromFile(qpFile);
        addLog(`✓ Extracted ${qpExtracted.length} characters from question paper`);

        if (msFile) {
          setProgressMsg("Extracting text from Mark Scheme PDF…"); setProgressPct(20);
          addLog("📄 Extracting mark scheme text...");
          msExtracted = await extractTextFromFile(msFile);
          addLog(`✓ Extracted ${msExtracted.length} characters from mark scheme`);
        }
      }

      if (!qpExtracted?.trim()) { setErrorMsg("No text found in the PDF. Try switching to Paste Text mode."); setPhase("error"); return; }

      // 2. Parse metadata
      const meta = filename ? extractPaperMeta(filename) : null;
      if (!meta && !useManualText) {
        setErrorMsg(`Could not parse paper metadata from filename "${filename}". Expected format: 9702_s25_qp_42.pdf`);
        setPhase("error"); return;
      }
      const code = meta?.code ?? "9702";
      const session = meta?.session ?? "S25";
      const variant = meta?.variant ?? "42";
      addLog(`📋 Paper: ${code}/${variant} · ${session}`);

      // 3. Split questions
      setProgressMsg("Splitting paper into individual questions…"); setProgressPct(30);
      const questions = splitByQuestions(qpExtracted);
      addLog(`✓ Found ${questions.length} questions`);

      if (questions.length === 0) {
        setErrorMsg("Could not split the paper into questions. The PDF text may be unreadable — try Paste Text mode.");
        setPhase("error"); return;
      }

      const msChunks = splitMarkSchemeByQuestion(msExtracted ?? "", questions.map(q => q.num));

      // 4. Process each question
      const results = [];
      const errors = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = buildQuestionId(code, session, variant, q.num);
        setProgressMsg(`AI classifying Q${q.num} of ${questions.length}…`);
        setProgressPct(30 + Math.round((i / questions.length) * 60));
        addLog(`🤖 Processing Q${q.num} (${questionId})…`);

        try {
          const msText_q = msChunks[q.num] ?? "";
          const analysis = await classifyAndGenerateNodes(q.text, msText_q, subject, anthropicKey, addLog);

          // Upsert question row
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

          // Upsert topics + junction
          for (const topicName of (analysis.topics ?? [])) {
            const topicKey = topicToKey(topicName);
            await upsertToSupabase(supabaseUrl, supabaseServiceKey, "topics", { key: topicKey, name: topicName, subject });
            await upsertToSupabase(supabaseUrl, supabaseServiceKey, "question_topics", { question_id: questionId, topic_key: topicKey });
          }

          // Delete + re-insert nodes
          await deleteFromSupabase(supabaseUrl, supabaseServiceKey, "mark_scheme_nodes", `question_id=eq.${questionId}`);
          if (analysis.nodes?.length > 0) {
            await upsertToSupabase(supabaseUrl, supabaseServiceKey, "mark_scheme_nodes",
              analysis.nodes.map(n => ({ ...n, question_id: questionId })));
          }

          results.push({ questionId, qNum: q.num, topics: analysis.topics ?? [], nodeCount: analysis.nodes?.length ?? 0, totalMarks: analysis.total_marks ?? 1 });
          addLog(`✓ Q${q.num} seeded — ${analysis.nodes?.length ?? 0} nodes, topics: ${(analysis.topics ?? []).join(", ")}`);

          // Rate limit pause between questions
          if (i < questions.length - 1) await new Promise(r => setTimeout(r, 600));
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
              Upload a Cambridge Question Paper + Mark Scheme. AI splits, classifies topics, and seeds mark scheme nodes into Supabase automatically.
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

          {/* Input mode */}
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
              <FileDropZone label="Question Paper PDF" accept=".pdf" file={qpFile} onFile={setQpFile}
                hint="e.g. 9702_s25_qp_42.pdf — filename must follow Cambridge naming convention" />
              <FileDropZone label="Mark Scheme PDF (recommended)" accept=".pdf" file={msFile} onFile={setMsFile}
                hint="e.g. 9702_s25_ms_42.pdf" />
            </div>
          ) : (
            <div className="space-y-3">
              <input value={manualFilename} onChange={e => setManualFilename(e.target.value)}
                placeholder="Filename for metadata parsing (e.g. 9702_s25_qp_42.pdf)"
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              <textarea value={qpText} onChange={e => setQpText(e.target.value)}
                placeholder="Paste the full question paper text…" rows={7}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono" />
              <textarea value={msText} onChange={e => setMsText(e.target.value)}
                placeholder="Paste the full mark scheme text (optional)…" rows={5}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono" />
            </div>
          )}

          {/* Credentials */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Credentials</p>
            <input value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="Supabase URL (https://xxx.supabase.co)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
            <input value={supabaseServiceKey} onChange={e => setSupabaseServiceKey(e.target.value)}
              placeholder="Supabase Service Role Key (eyJ…)"
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
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 max-h-48 overflow-y-auto space-y-0.5">
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

          {/* SQL migration hint */}
          <details className="group">
            <summary className="text-[11px] text-white/25 cursor-pointer hover:text-white/40 list-none flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              View required SQL migration (run once in Supabase)
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
);

CREATE INDEX IF NOT EXISTS idx_msn_question ON mark_scheme_nodes(question_id);
CREATE INDEX IF NOT EXISTS idx_qt_question   ON question_topics(question_id);
CREATE INDEX IF NOT EXISTS idx_qt_topic      ON question_topics(topic_key);`}
            </pre>
          </details>

        </div>
      </div>
    </div>
  );
}