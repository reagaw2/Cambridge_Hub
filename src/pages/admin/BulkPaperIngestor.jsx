import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Plus, Trash2, Upload } from "lucide-react";
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

async function classifyAndGenerateNodes(questionText, markSchemeText, subject, anthropicKey) {
  const topicList = SYLLABUS_TOPICS[subject].join(", ");
  const prompt = `You are an expert Cambridge ${subject === "physics" ? "A Level Physics (9702)" : "A Level Computer Science (9618)"} examiner.

QUESTION TEXT:
${questionText.slice(0, 2000)}

MARK SCHEME:
${(markSchemeText || "(not available)").slice(0, 2000)}

AVAILABLE TOPICS: ${topicList}

Respond ONLY in this JSON format — no extra text, no markdown:
{
  "topics": ["1-3 matching topics from the available list above"],
  "total_marks": <integer — count the actual marks from the mark scheme>,
  "difficulty": "easy" | "medium" | "hard",
  "nodes": [
    {
      "node_index": 0,
      "mark_type": "B1",
      "keyword": "exact key phrase the student must include to earn this mark",
      "aliases": ["2-3 alternative acceptable phrasings"],
      "is_mandatory": false,
      "dependent_on": null,
      "max_marks": 1
    }
  ]
}

Rules:
- Create one node per mark point in the mark scheme
- Use M1 for mandatory marks that must precede A1 marks
- Set dependent_on to the node_index of the prerequisite M1 if this is an A1
- Count B1, M1, A1 marks carefully to get total_marks right`;

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
      max_tokens: 2000,
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

async function aiSplitPaper(fullQPText, fullMSText, subject, anthropicKey) {
  const topicList = SYLLABUS_TOPICS[subject].join(", ");
  const prompt = `You are a Cambridge ${subject === "physics" ? "A Level Physics (9702)" : "A Level Computer Science (9618)"} examiner.

Split the following question paper and mark scheme into individual top-level questions.
For each question, pair it with its corresponding mark scheme section.

AVAILABLE TOPICS: ${topicList}

QUESTION PAPER:
${fullQPText.slice(0, 5000)}

MARK SCHEME:
${(fullMSText || "").slice(0, 5000)}

Respond ONLY in this JSON format:
{
  "questions": [
    {
      "num": 1,
      "question_text": "full text of question 1 including all sub-parts",
      "mark_scheme_text": "full mark scheme for question 1"
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
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic split error ${res.status}`);
  const data = await res.json();
  let text = data.content?.[0]?.text ?? "{}";
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) text = jsonMatch[1].trim();
  const parsed = JSON.parse(text);
  return (parsed.questions ?? []).filter(q => q.question_text?.trim().length > 20);
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
          reject(new Error(`"${file.name}" looks like a scanned PDF. Switch to Paste Text mode.`));
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

function FileDropZone({ label, accept, file, onFile, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
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
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-xs font-semibold text-white truncate max-w-[200px]">{file.name}</p>
          <p className="text-[10px] text-white/30">({(file.size / 1024).toFixed(0)} KB)</p>
        </div>
      ) : (
        <div className="space-y-1">
          <Upload className="w-5 h-5 text-white/30 mx-auto" />
          <p className="text-xs font-semibold text-white/50">{label}</p>
          {hint && <p className="text-[10px] text-white/25">{hint}</p>}
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

  // Mode: "bulk" = paste full paper text | "manual" = add Q+MS pairs individually
  const [mode, setMode] = useState("bulk");
  const [subject, setSubject] = useState("cs");
  const [paperCode, setPaperCode] = useState("9618");
  const [paperSession, setPaperSession] = useState("ONW25");
  const [paperVariant, setPaperVariant] = useState("13");

  // Bulk mode state
  const [bulkQPText, setBulkQPText] = useState("");
  const [bulkMSText, setBulkMSText] = useState("");
  const [qpFile, setQpFile] = useState(null);
  const [msFile, setMsFile] = useState(null);
  const [useFiles, setUseFiles] = useState(false);

  // Manual mode state — array of { id, question, markscheme }
  const [pairs, setPairs] = useState([{ id: 1, question: "", markscheme: "" }]);

  // Credentials
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? "");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY ?? "");

  // Run state
  const [phase, setPhase] = useState("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState([]);

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

  function addPair() {
    setPairs(prev => [...prev, { id: Date.now(), question: "", markscheme: "" }]);
  }

  function removePair(id) {
    setPairs(prev => prev.filter(p => p.id !== id));
  }

  function updatePair(id, field, value) {
    setPairs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  async function processQuestion(questionText, markSchemeText, qNum, code, session, variant) {
    const questionId = buildQuestionId(code, session, variant, qNum);
    addLog(`🤖 Processing Q${qNum} → ${questionId}…`);

    const analysis = await classifyAndGenerateNodes(questionText, markSchemeText, subject, anthropicKey);

    await upsertToSupabase(supabaseUrl, supabaseServiceKey, "questions", {
      id: questionId,
      topic: analysis.topics?.[0] ?? "Unknown",
      topic_key: topicToKey(analysis.topics?.[0] ?? "unknown"),
      subject,
      paper_ref: `${code}/${variant} · ${session}`,
      label: `Question ${qNum}`,
      question_text: questionText.slice(0, 2000),
      total_marks: analysis.total_marks ?? 1,
      difficulty: analysis.difficulty ?? "medium",
      mark_scheme_text: markSchemeText.slice(0, 3000),
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

    addLog(`✓ Q${qNum}: [${(analysis.topics ?? []).join(", ")}] | ${analysis.total_marks} marks | ${analysis.nodes?.length ?? 0} nodes`);
    return { questionId, qNum, topics: analysis.topics ?? [], nodeCount: analysis.nodes?.length ?? 0, totalMarks: analysis.total_marks ?? 1 };
  }

  async function handleRun() {
    if (!supabaseUrl || !supabaseServiceKey) { setErrorMsg("Supabase URL and Service Role key are required."); return; }
    if (!anthropicKey) { setErrorMsg("Anthropic API key is required."); return; }
    if (!paperCode.trim() || !paperSession.trim() || !paperVariant.trim()) { setErrorMsg("Fill in Paper Code, Session and Variant."); return; }

    setPhase("running");
    setErrorMsg("");
    setResult(null);
    setLogs([]);

    const code = paperCode.trim().toUpperCase();
    const session = paperSession.trim().toUpperCase();
    const variant = paperVariant.trim();

    const results = [];
    const errors = [];

    try {
      let questionsToProcess = [];

      if (mode === "manual") {
        // Manual pairs mode — each pair is already question + mark scheme
        questionsToProcess = pairs
          .filter(p => p.question.trim())
          .map((p, i) => ({ num: i + 1, question_text: p.question.trim(), mark_scheme_text: p.markscheme.trim() }));
        addLog(`📋 Manual mode: ${questionsToProcess.length} question${questionsToProcess.length !== 1 ? "s" : ""} to process`);
      } else {
        // Bulk mode — extract text then AI-split
        let qpExtracted = bulkQPText;
        let msExtracted = bulkMSText;

        if (useFiles) {
          if (qpFile) {
            setProgressMsg("Extracting text from Question Paper PDF…"); setProgressPct(10);
            addLog("📄 Extracting question paper text...");
            qpExtracted = await extractTextFromFile(qpFile);
            addLog(`✓ Extracted ${qpExtracted.length} chars`);
          }
          if (msFile) {
            setProgressMsg("Extracting text from Mark Scheme PDF…"); setProgressPct(15);
            addLog("📄 Extracting mark scheme text...");
            msExtracted = await extractTextFromFile(msFile);
            addLog(`✓ Extracted ${msExtracted.length} chars from mark scheme`);
          }
        }

        if (!qpExtracted?.trim()) { setErrorMsg("No question paper text found."); setPhase("error"); return; }

        setProgressMsg("AI splitting paper into questions…"); setProgressPct(25);
        addLog("🤖 AI is splitting the paper into individual questions…");
        const split = await aiSplitPaper(qpExtracted, msExtracted ?? "", subject, anthropicKey);
        addLog(`✓ AI found ${split.length} questions`);
        questionsToProcess = split.map((q, i) => ({ num: q.num ?? (i + 1), question_text: q.question_text, mark_scheme_text: q.mark_scheme_text ?? "" }));
      }

      if (questionsToProcess.length === 0) { setErrorMsg("No questions to process."); setPhase("error"); return; }

      addLog(`📋 Processing ${questionsToProcess.length} question${questionsToProcess.length !== 1 ? "s" : ""} for ${code}/${variant} · ${session}`);

      for (let i = 0; i < questionsToProcess.length; i++) {
        const q = questionsToProcess[i];
        setProgressMsg(`Processing Q${q.num} of ${questionsToProcess.length}…`);
        setProgressPct(30 + Math.round((i / questionsToProcess.length) * 65));
        try {
          const r = await processQuestion(q.question_text, q.mark_scheme_text ?? "", q.num, code, session, variant);
          results.push(r);
        } catch (err) {
          errors.push({ qNum: q.num, error: err.message });
          addLog(`✗ Q${q.num} failed: ${err.message}`);
        }
        if (i < questionsToProcess.length - 1) await new Promise(r => setTimeout(r, 600));
      }

      setProgressMsg("Done!"); setProgressPct(100);
      setResult({ paperId: `${code}/${variant}/${session}`, questionsFound: questionsToProcess.length, questionsProcessed: results.length, errors, results });
      setPhase("done");
    } catch (err) {
      setErrorMsg(err.message ?? String(err));
      setPhase("error");
    }
  }

  const isRunning = phase === "running";
  const canRun = mode === "manual"
    ? pairs.some(p => p.question.trim())
    : (bulkQPText.trim() || qpFile);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto flex flex-col min-h-screen">
        {/* Top bar */}
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
                <input value={paperCode} onChange={e => setPaperCode(e.target.value)} placeholder="9618"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/30">Session (e.g. ONW25)</label>
                <input value={paperSession} onChange={e => setPaperSession(e.target.value)} placeholder="ONW25"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/30">Variant</label>
                <input value={paperVariant} onChange={e => setPaperVariant(e.target.value)} placeholder="13"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
              </div>
            </div>
            <p className="text-[10px] text-white/20">Session: MJ=May/Jun, ON=Oct/Nov, FM=Feb/Mar + 2-digit year</p>
          </div>

          {/* Mode toggle */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Input Method</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode("bulk")}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold text-left transition-all space-y-0.5 ${mode === "bulk" ? "bg-amber-500/15 border-amber-500/40 text-amber-300" : "bg-white/[0.03] border-white/8 text-white/40 hover:border-white/15"}`}>
                <p>📄 Paste Full Paper</p>
                <p className="text-[10px] font-normal opacity-70">AI splits into questions automatically</p>
              </button>
              <button onClick={() => setMode("manual")}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold text-left transition-all space-y-0.5 ${mode === "manual" ? "bg-amber-500/15 border-amber-500/40 text-amber-300" : "bg-white/[0.03] border-white/8 text-white/40 hover:border-white/15"}`}>
                <p>✍️ Pair Q + Mark Scheme</p>
                <p className="text-[10px] font-normal opacity-70">Most accurate — one box per question</p>
              </button>
            </div>
          </div>

          {/* BULK MODE */}
          {mode === "bulk" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <button onClick={() => setUseFiles(false)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${!useFiles ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/8 text-white/30"}`}>
                  ✍️ Paste text
                </button>
                <button onClick={() => setUseFiles(true)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${useFiles ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/8 text-white/30"}`}>
                  📁 Upload PDFs
                </button>
              </div>

              {!useFiles ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Question Paper Text</label>
                    <textarea value={bulkQPText} onChange={e => setBulkQPText(e.target.value)}
                      placeholder="Paste the full question paper text here. AI will split it into individual questions automatically."
                      rows={8}
                      className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Mark Scheme Text</label>
                    <textarea value={bulkMSText} onChange={e => setBulkMSText(e.target.value)}
                      placeholder="Paste the full mark scheme text here. AI will pair each question with its mark scheme."
                      rows={6}
                      className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono" />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Question Paper PDF</label>
                    <FileDropZone label="Drop QP PDF here" accept=".pdf" file={qpFile} onFile={setQpFile} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Mark Scheme PDF</label>
                    <FileDropZone label="Drop MS PDF here" accept=".pdf" file={msFile} onFile={setMsFile} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANUAL PAIRS MODE */}
          {mode === "manual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Question + Mark Scheme Pairs ({pairs.length})
                </p>
                <button onClick={addPair}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              {pairs.map((pair, idx) => (
                <div key={pair.id} className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Question {idx + 1}
                    </span>
                    {pairs.length > 1 && (
                      <button onClick={() => removePair(pair.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/25 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/30">Question text (include all sub-parts)</label>
                    <textarea
                      value={pair.question}
                      onChange={e => updatePair(pair.id, "question", e.target.value)}
                      placeholder="Paste the full question here, including all sub-parts (a), (b)(i), etc."
                      rows={4}
                      className="w-full bg-black/20 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/30 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/30">Mark scheme for this question</label>
                    <textarea
                      value={pair.markscheme}
                      onChange={e => updatePair(pair.id, "markscheme", e.target.value)}
                      placeholder="Paste the full mark scheme for this question. Include all B1, M1, A1 marks."
                      rows={4}
                      className="w-full bg-black/20 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-green-500/30 font-mono"
                    />
                  </div>
                </div>
              ))}

              <button onClick={addPair}
                className="w-full border-2 border-dashed border-white/8 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm text-white/25 hover:text-white/50 hover:border-white/20 transition-all">
                <Plus className="w-4 h-4" /> Add another question
              </button>
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
                  <p className="font-bold text-white">Done — {result.paperId}</p>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Seeded</p>
                {result.results?.map(r => <ResultRow key={r.questionId} r={r} />)}
              </div>
            </div>
          )}

          {/* Run button */}
          <button onClick={handleRun}
            disabled={isRunning || !canRun}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isRunning
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : phase === "done"
                ? <><Zap className="w-4 h-4" /> Run Again</>
                : <><Zap className="w-4 h-4" /> Classify & Ingest</>}
          </button>

        </div>
      </div>
    </div>
  );
}