/**
 * FullPaperParser — paste the full paper text + mark scheme text,
 * Claude automatically splits them into individual sub-questions,
 * preview, then save all to Supabase in one click.
 *
 * Only accessible to reaganmungoma@gmail.com.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Save, Eye } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { supabaseClient } from "@/api/base44Client";

const DEV_EMAIL = "reaganmungoma@gmail.com";

function topicToKey(topic) {
  return (topic ?? "unknown").toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/_+/g, "_");
}

async function upsertRow(table, row) {
  const { error } = await supabaseClient.from(table).upsert(row, { onConflict: "id" });
  if (error) throw new Error(`[${table}] ${error.message}`);
}

function QuestionCard({ q, idx }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            {q.question_number ?? `Q${idx + 1}`}
          </span>
          <span className="text-xs text-muted-foreground">{q.topic}</span>
          <span className="text-[11px] text-muted-foreground/50">[{q.total_marks}m]</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Question</p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{q.question_text}</p>
          </div>
          <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/70 mb-1">Mark Scheme</p>
            <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{q.mark_scheme_text}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(q.mark_points ?? []).map((pt, i) => (
              <div key={i} className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-lg">
                {pt.notation}: {pt.keyword}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FullPaperParser() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject]         = useState("physics");
  const [paperCode, setPaperCode]     = useState("9702");
  const [paperSession, setPaperSession] = useState("Nov 2025");
  const [paperVariant, setPaperVariant] = useState("41");
  const [paperText, setPaperText]     = useState("");
  const [msText, setMsText]           = useState("");

  const [phase, setPhase]             = useState("idle"); // idle | parsing | preview | saving | done
  const [parsed, setParsed]           = useState([]);
  const [saveResults, setSaveResults] = useState([]);
  const [errorMsg, setErrorMsg]       = useState("");
  const [logs, setLogs]               = useState([]);

  if (user?.email !== DEV_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <p className="text-sm text-white/30">Access restricted.</p>
      </div>
    );
  }

  function addLog(msg) { setLogs(p => [...p, msg]); }

  async function handleParse() {
    if (!paperText.trim()) { setErrorMsg("Paste the question paper text first."); return; }
    setPhase("parsing"); setErrorMsg(""); setParsed([]); setLogs([]);
    addLog("🤖 Sending to Claude for auto-parsing…");

    const syllabus = subject === "physics"
      ? "Physical Quantities, Kinematics, Forces, Momentum, Work/Energy/Power, Deformation, Waves, Circular Motion, Gravitational Fields, Thermal Physics, Oscillations, Electric Fields, Capacitance, Magnetic Fields, Electromagnetic Induction, Alternating Currents, Quantum Physics, Nuclear Physics, Medical Imaging, Astrophysics"
      : "Data Representation, Compression, Networks, Hardware, Operating Systems, Language Translators, Data Security, Data Integrity, Ethics, Databases, Algorithms, Programming";

    const prompt = `You are an expert Cambridge A Level ${subject === "physics" ? "Physics (9702)" : "Computer Science (9618)"} examiner.

I will give you the raw text of a past paper and its mark scheme. Your job is to:
1. Split the paper into EVERY individual sub-question (e.g. 1(a), 1(b)(i), 2(a), etc.)
2. Match each sub-question to its mark scheme
3. Extract mark points as atomic keywords

QUESTION PAPER TEXT:
${paperText.slice(0, 8000)}

MARK SCHEME TEXT:
${(msText || "(not provided — infer from question context)").slice(0, 6000)}

AVAILABLE TOPICS: ${syllabus}

Respond ONLY with valid JSON — an array of question objects:
[
  {
    "question_number": "1(a)",
    "topic": "one topic from the available list",
    "question_text": "full question text exactly as written",
    "total_marks": 2,
    "mark_scheme_text": "full mark scheme for this sub-question",
    "mark_points": [
      { "notation": "B1", "keyword": "exact phrase student must write", "is_mandatory": false, "dependent_on": null }
    ]
  }
]

Rules:
- Include EVERY sub-part as a separate entry
- "notation" must be B1, M1, A1, or C1
- M1 marks are mandatory — set dependent_on to the node_index of the M1 for any A1 that follows it
- Keep question_text verbatim including units and context
- If mark scheme is not provided, write a sensible Cambridge-style mark scheme based on the question`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_number:  { type: "string" },
              topic:            { type: "string" },
              question_text:    { type: "string" },
              total_marks:      { type: "number" },
              mark_scheme_text: { type: "string" },
              mark_points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    notation:      { type: "string" },
                    keyword:       { type: "string" },
                    is_mandatory:  { type: "boolean" },
                    dependent_on:  { type: "number" },
                  }
                }
              }
            }
          }
        },
      });

      let data = result?.response ?? result;
      if (!Array.isArray(data)) {
        // Try to extract JSON array from response
        const match = JSON.stringify(data).match(/\[[\s\S]*\]/);
        if (match) data = JSON.parse(match[0]);
        else throw new Error("No array returned from Claude");
      }

      addLog(`✓ Claude parsed ${data.length} sub-questions`);
      setParsed(data);
      setPhase("preview");
    } catch (err) {
      setErrorMsg(`Parse failed: ${err.message}`);
      addLog(`✗ Error: ${err.message}`);
      setPhase("idle");
    }
  }

  async function handleSave() {
    if (!parsed.length) return;
    setPhase("saving"); setSaveResults([]); setErrorMsg("");

    const code    = paperCode.trim().toUpperCase();
    const session = paperSession.trim();
    const variant = paperVariant.trim();
    const paperRef = `${code}/${variant} · ${session}`;

    const results = [];
    const errors  = [];

    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      const safeQNum = (q.question_number ?? String(i + 1)).replace(/[^a-zA-Z0-9]/g, "_");
      const qId = `${code}_${session.replace(/\s/g, "_")}_${variant}_${safeQNum}`;
      addLog(`Saving ${q.question_number}…`);

      try {
        // 1. Upsert into questions table
        await upsertRow("questions", {
          id: qId,
          topic: q.topic ?? "Unknown",
          topic_key: topicToKey(q.topic),
          subject,
          paper_ref: paperRef,
          label: `Question ${q.question_number}`,
          question_text: (q.question_text ?? "").slice(0, 3000),
          total_marks: q.total_marks ?? 1,
          mark_scheme_text: (q.mark_scheme_text ?? "").slice(0, 3000),
        });

        // 2. Upsert topic
        await upsertRow("topics", {
          key: topicToKey(q.topic),
          name: q.topic ?? "Unknown",
          subject,
        });

        // 3. Delete old nodes for this question
        await supabaseClient.from("mark_scheme_nodes").delete().eq("question_id", qId);

        // 4. Insert fresh mark scheme nodes
        const nodes = (q.mark_points ?? []).map((pt, ni) => ({
          question_id:  qId,
          node_index:   ni,
          mark_type:    pt.notation ?? "B1",
          keyword:      pt.keyword ?? "",
          aliases:      [],
          is_mandatory: pt.is_mandatory ?? false,
          dependent_on: pt.dependent_on ?? null,
          max_marks:    1,
        }));

        if (nodes.length > 0) {
          const { error: ne } = await supabaseClient.from("mark_scheme_nodes").insert(nodes);
          if (ne) throw new Error(`nodes: ${ne.message}`);
        }

        results.push({ qNum: q.question_number, id: qId, topic: q.topic, marks: q.total_marks, nodes: nodes.length });
        addLog(`✓ ${q.question_number} saved (${nodes.length} mark nodes)`);
      } catch (err) {
        errors.push({ qNum: q.question_number, error: err.message });
        addLog(`✗ ${q.question_number}: ${err.message}`);
      }
    }

    setSaveResults({ results, errors });
    setPhase("done");
  }

  const isIdle    = phase === "idle";
  const isParsing = phase === "parsing";
  const isPreview = phase === "preview";
  const isSaving  = phase === "saving";
  const isDone    = phase === "done";

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[680px] mx-auto flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 bg-[#0d0d1a]/95 backdrop-blur z-20">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white">Full Paper Auto-Parser</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400/60 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6 pb-10">

          {/* Explainer */}
          <div className="bg-purple-500/8 border border-purple-500/20 rounded-2xl p-4 space-y-1.5">
            <p className="text-sm font-bold text-white">How it works</p>
            <ol className="text-xs text-white/50 leading-relaxed space-y-1 list-decimal list-inside">
              <li>Set paper details below</li>
              <li>Paste the <strong className="text-white/70">full paper text</strong> (copy from PDF, or use OCR)</li>
              <li>Paste the <strong className="text-white/70">mark scheme text</strong> (optional but recommended)</li>
              <li>Click <strong className="text-purple-400">Auto-Parse</strong> — Claude splits every sub-question automatically</li>
              <li>Preview and click <strong className="text-emerald-400">Save All to Supabase</strong></li>
            </ol>
          </div>

          {/* Paper metadata */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Paper Details</p>

            {/* Subject */}
            <div className="grid grid-cols-2 gap-2">
              {["physics", "cs"].map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    subject === s
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                  }`}>
                  {s === "physics" ? "Physics (9702)" : "Computer Science (9618)"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ["Paper Code", paperCode, setPaperCode, "9702"],
                ["Session", paperSession, setPaperSession, "Nov 2025"],
                ["Variant", paperVariant, setPaperVariant, "41"],
              ].map(([label, val, setter, ph]) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] text-white/30">{label}</label>
                  <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40" />
                </div>
              ))}
            </div>
          </div>

          {/* Paste areas */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Question Paper Text <span className="text-purple-400">*</span>
              </label>
              <textarea
                value={paperText}
                onChange={e => setPaperText(e.target.value)}
                placeholder="Paste the full question paper text here (copy text from PDF, or use OCR). Claude will automatically identify and split every sub-question."
                rows={8}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-purple-500/40 transition-all font-mono leading-relaxed"
              />
              <p className="text-[10px] text-white/25">{paperText.length.toLocaleString()} characters</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Mark Scheme Text <span className="text-white/20">(optional but recommended)</span>
              </label>
              <textarea
                value={msText}
                onChange={e => setMsText(e.target.value)}
                placeholder="Paste the mark scheme text here. If left blank, Claude will generate a best-effort mark scheme from the question context."
                rows={6}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-emerald-500/40 transition-all font-mono leading-relaxed"
              />
              <p className="text-[10px] text-white/25">{msText.length.toLocaleString()} characters</p>
            </div>
          </div>

          {/* Parse button */}
          {(isIdle || isParsing) && (
            <button
              onClick={handleParse}
              disabled={isParsing || !paperText.trim()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold text-sm py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isParsing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Claude is parsing your paper…</>
                : <><Zap className="w-4 h-4" /> Auto-Parse with Claude</>}
            </button>
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
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          {/* Preview */}
          {(isPreview || isSaving || isDone) && parsed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-bold text-white">{parsed.length} questions parsed</p>
                </div>
                {isPreview && (
                  <button
                    onClick={() => { setParsed([]); setPaperText(""); setMsText(""); setLogs([]); setPhase("idle"); }}
                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                  >
                    ← Start over
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {parsed.map((q, i) => (
                  <QuestionCard key={i} q={q} idx={i} />
                ))}
              </div>

              {isPreview && (
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold text-sm py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <Save className="w-4 h-4" /> Save All {parsed.length} Questions to Supabase
                </button>
              )}

              {isSaving && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  <p className="text-sm text-white/60">Saving to Supabase…</p>
                </div>
              )}
            </div>
          )}

          {/* Done */}
          {isDone && saveResults?.results && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <p className="font-bold text-white">Done!</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    ["Saved", saveResults.results?.length ?? 0, "text-emerald-400"],
                    ["Errors", saveResults.errors?.length ?? 0, saveResults.errors?.length ? "text-red-400" : "text-white"],
                    ["Total nodes", saveResults.results?.reduce((s, r) => s + r.nodes, 0) ?? 0, "text-purple-400"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                      <p className={`text-xl font-black ${color}`}>{val}</p>
                      <p className="text-[10px] text-white/30">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {saveResults.errors?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Errors</p>
                  {saveResults.errors.map((e, i) => (
                    <div key={i} className="bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                      <p className="text-xs text-red-300">{e.qNum}: {e.error}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setParsed([]); setPaperText(""); setMsText(""); setLogs([]); setSaveResults([]); setPhase("idle"); }}
                  className="flex items-center justify-center gap-2 border border-white/10 text-white/60 font-semibold text-sm py-3 rounded-xl hover:brightness-110 transition-all">
                  Parse Another Paper
                </button>
                <button onClick={() => navigate("/")}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 transition-all">
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}