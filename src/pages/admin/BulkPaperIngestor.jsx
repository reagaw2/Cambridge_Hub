import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Plus, Trash2, Database } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { PRELOADED_PAIRS } from "@/lib/ingestorQuestions";

const DEV_EMAIL = "reaganmungoma@gmail.com";

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

QUESTION:
${questionText.slice(0, 1500)}

MARK SCHEME:
${(markSchemeText || "").slice(0, 1500)}

AVAILABLE TOPICS: ${topicList}

Respond ONLY in valid JSON:
{
  "topics": ["1-2 matching topics from the list"],
  "total_marks": <integer>,
  "difficulty": "easy" | "medium" | "hard",
  "nodes": [
    {
      "node_index": 0,
      "mark_type": "B1",
      "keyword": "exact phrase student must include",
      "aliases": ["alternative phrasing"],
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

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  let text = data.content?.[0]?.text ?? "{}";
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (m) text = m[1].trim();
  return JSON.parse(text);
}

async function upsertRow(supabaseUrl, key, table, row) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok && res.status !== 409) throw new Error(`[${table}] ${await res.text()}`);
}

async function deleteWhere(supabaseUrl, key, table, filter) {
  await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: { "apikey": key, "Authorization": `Bearer ${key}` },
  });
}

function ResultRow({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.03] transition-all">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Q{r.qNum} — {r.topics?.[0] ?? "Unknown"}</p>
            <p className="text-[10px] text-white/35">{r.questionId} · {r.totalMarks}m · {r.nodeCount} nodes</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-white/25" /> : <ChevronDown className="w-3.5 h-3.5 text-white/25" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-white/5 pt-2">
          <p className="text-[10px] text-white/40">Topics: {r.topics?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default function BulkPaperIngestor() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject] = useState("cs");
  const [paperCode, setPaperCode] = useState("9608");
  const [paperSession, setPaperSession] = useState("MIX");
  const [paperVariant, setPaperVariant] = useState("DR");
  const [pairs, setPairs] = useState(PRELOADED_PAIRS.map(p => ({ ...p })));
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? "");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY ?? "");
  const [phase, setPhase] = useState("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState([]);
  const [expandedPair, setExpandedPair] = useState(null);

  if (user?.email !== DEV_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <p className="text-sm text-white/30">Access restricted.</p>
      </div>
    );
  }

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const addPair = () => {
    const newId = Math.max(...pairs.map(p => p.id), 0) + 1;
    setPairs(prev => [...prev, { id: newId, question: "", markscheme: "" }]);
  };

  const removePair = (id) => setPairs(prev => prev.filter(p => p.id !== id));
  const updatePair = (id, field, value) => setPairs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  async function handleRun() {
    if (!supabaseUrl || !supabaseServiceKey) { setErrorMsg("Supabase URL and Service Role key are required."); return; }
    if (!anthropicKey) { setErrorMsg("Anthropic API key is required."); return; }
    if (!paperCode.trim() || !paperSession.trim() || !paperVariant.trim()) { setErrorMsg("Fill in Paper Code, Session and Variant."); return; }

    const activePairs = pairs.filter(p => p.question.trim());
    if (!activePairs.length) { setErrorMsg("No questions to process."); return; }

    setPhase("running"); setErrorMsg(""); setResult(null); setLogs([]);
    const code = paperCode.trim().toUpperCase();
    const session = paperSession.trim().toUpperCase();
    const variant = paperVariant.trim();
    const results = [];
    const errors = [];

    addLog(`📋 ${activePairs.length} questions — ${code}/${variant} · ${session}`);

    for (let i = 0; i < activePairs.length; i++) {
      const pair = activePairs[i];
      const qNum = i + 1;
      const questionId = buildQuestionId(code, session, variant, qNum);
      setProgressMsg(`Processing Q${qNum} / ${activePairs.length}…`);
      setProgressPct(Math.round((i / activePairs.length) * 95));

      try {
        const analysis = await classifyAndGenerateNodes(pair.question, pair.markscheme, subject, anthropicKey);

        await upsertRow(supabaseUrl, supabaseServiceKey, "questions", {
          id: questionId,
          topic: analysis.topics?.[0] ?? "Unknown",
          topic_key: topicToKey(analysis.topics?.[0] ?? "unknown"),
          subject,
          paper_ref: `${code}/${variant} · ${session}`,
          label: `Question ${qNum}`,
          question_text: pair.question.slice(0, 2000),
          total_marks: analysis.total_marks ?? 1,
          difficulty: analysis.difficulty ?? "medium",
          mark_scheme_text: pair.markscheme.slice(0, 3000),
        });

        for (const topicName of (analysis.topics ?? [])) {
          const topicKey = topicToKey(topicName);
          await upsertRow(supabaseUrl, supabaseServiceKey, "topics", { key: topicKey, name: topicName, subject });
          await upsertRow(supabaseUrl, supabaseServiceKey, "question_topics", { question_id: questionId, topic_key: topicKey });
        }

        await deleteWhere(supabaseUrl, supabaseServiceKey, "mark_scheme_nodes", `question_id=eq.${questionId}`);
        if (analysis.nodes?.length > 0) {
          await upsertRow(supabaseUrl, supabaseServiceKey, "mark_scheme_nodes",
            analysis.nodes.map(n => ({ ...n, question_id: questionId })));
        }

        results.push({ questionId, qNum, topics: analysis.topics ?? [], nodeCount: analysis.nodes?.length ?? 0, totalMarks: analysis.total_marks ?? 1 });
        addLog(`✓ Q${qNum}: [${(analysis.topics ?? []).join(", ")}] ${analysis.total_marks}m ${analysis.nodes?.length ?? 0}nodes`);

        if (i < activePairs.length - 1) await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        errors.push({ qNum, error: err.message });
        addLog(`✗ Q${qNum}: ${err.message}`);
      }
    }

    setProgressMsg("Done!"); setProgressPct(100);
    setResult({ paperId: `${code}/${variant}/${session}`, questionsFound: activePairs.length, questionsProcessed: results.length, errors, results });
    setPhase("done");
  }

  const isRunning = phase === "running";
  const activePairCount = pairs.filter(p => p.question.trim()).length;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 bg-[#0d0d1a]/95 backdrop-blur z-20">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Bulk Paper Ingestor</span>
          </div>
          <span className="text-[10px] text-amber-400/60 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            {activePairCount} Qs
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pt-5 pb-10">

          {/* Pre-load banner */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl shrink-0">📦</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">40 questions pre-loaded</p>
              <p className="text-xs text-white/40">Fill in credentials below and click Ingest.</p>
            </div>
          </div>

          {/* Subject */}
          <div className="grid grid-cols-2 gap-2">
            {[{ value: "cs", label: "Computer Science (9618)" }, { value: "physics", label: "Physics (9702)" }].map(s => (
              <button key={s.value} onClick={() => setSubject(s.value)}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  subject === s.value ? "bg-amber-500/15 border-amber-500/40 text-amber-300" : "bg-white/[0.03] border-white/8 text-white/40 hover:border-white/15"
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Paper details + credentials in one box */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Paper Details</p>
            <div className="grid grid-cols-3 gap-2">
              {[["Code", paperCode, setPaperCode, "9608"], ["Session", paperSession, setPaperSession, "MIX"], ["Variant", paperVariant, setPaperVariant, "DR"]].map(([label, val, setter, ph]) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] text-white/30">{label}</label>
                  <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 pt-1">Credentials</p>
            <input value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="Supabase URL"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
            <input value={supabaseServiceKey} onChange={e => setSupabaseServiceKey(e.target.value)}
              placeholder="service_role key (eyJ…)" type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
            <input value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)}
              placeholder="Anthropic API Key (sk-ant-…)" type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40" />
          </div>

          {/* Ingest button */}
          <button onClick={handleRun}
            disabled={isRunning || activePairCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isRunning
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Q{Math.round(progressPct / 100 * activePairCount)}/{activePairCount}…</>
              : phase === "done"
                ? <><Zap className="w-4 h-4" /> Run Again</>
                : <><Zap className="w-4 h-4" /> Classify & Ingest {activePairCount} Questions</>}
          </button>

          {/* Progress bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-[11px] text-amber-300/70 text-center">{progressMsg}</p>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 max-h-48 overflow-y-auto space-y-0.5">
              {logs.map((l, i) => (
                <p key={i} className="text-[11px] font-mono text-white/50">{l}</p>
              ))}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/8 border border-red-500/25 rounded-xl p-3 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          {/* Results */}
          {phase === "done" && result && (
            <div className="space-y-3">
              <div className="bg-green-500/8 border border-green-500/25 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <p className="font-bold text-white text-sm">{result.paperId}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[["Found", result.questionsFound, "text-white"], ["Seeded", result.questionsProcessed, "text-green-400"], ["Errors", result.errors?.length ?? 0, result.errors?.length ? "text-red-400" : "text-white"]].map(([label, val, color]) => (
                    <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                      <p className={`text-xl font-black ${color}`}>{val}</p>
                      <p className="text-[10px] text-white/35">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Errors</p>
                  {result.errors.map((e, i) => (
                    <div key={i} className="bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                      <p className="text-xs text-red-300">Q{e.qNum}: {e.error}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Seeded</p>
                {result.results?.map(r => <ResultRow key={r.questionId} r={r} />)}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/5 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Review / Edit Questions</p>
              <button onClick={addPair}
                className="flex items-center gap-1 text-xs text-amber-400/60 hover:text-amber-400 transition-colors">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {pairs.map((pair, idx) => (
              <div key={pair.id} className="border border-white/6 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPair(expandedPair === pair.id ? null : pair.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-amber-400/60 shrink-0">Q{idx + 1}</span>
                    <p className="text-xs text-white/50 truncate">{pair.question.slice(0, 60)}…</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pairs.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removePair(pair.id); }}
                        className="p-1 rounded hover:bg-red-500/15 text-white/20 hover:text-red-400 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {expandedPair === pair.id
                      ? <ChevronUp className="w-3.5 h-3.5 text-white/25" />
                      : <ChevronDown className="w-3.5 h-3.5 text-white/25" />}
                  </div>
                </button>

                {expandedPair === pair.id && (
                  <div className="px-3 pb-3 border-t border-white/5 pt-2 space-y-2">
                    <textarea value={pair.question} onChange={e => updatePair(pair.id, "question", e.target.value)}
                      placeholder="Question text…" rows={4}
                      className="w-full bg-black/20 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/30 font-mono" />
                    <textarea value={pair.markscheme} onChange={e => updatePair(pair.id, "markscheme", e.target.value)}
                      placeholder="Mark scheme…" rows={3}
                      className="w-full bg-black/20 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-green-500/30 font-mono" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}