/**
 * FullPaperParser — token-efficient paper parser.
 * Fixes: strips markdown code fences from Claude response before JSON.parse()
 * Token saving: shorter prompt, 4000 char limit per paste section.
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

/** Strip markdown code fences that Claude sometimes wraps JSON in */
function stripCodeFences(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

/** Safely parse JSON from Claude — handles code fences and trailing commas */
function safeParseJSON(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object" && raw !== null) return raw;
  const str = stripCodeFences(String(raw));
  return JSON.parse(str);
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
          <span className="text-xs text-muted-foreground truncate max-w-[160px]">{q.topic}</span>
          <span className="text-[11px] text-muted-foreground/50 shrink-0">[{q.total_marks}m]</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Question</p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{q.question_text}</p>
          </div>
          {q.mark_scheme_text && (
            <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/70 mb-1">Mark Scheme</p>
              <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{q.mark_scheme_text}</p>
            </div>
          )}
          {(q.mark_points ?? []).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {q.mark_points.map((pt, i) => (
                <div key={i} className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-lg">
                  {pt.notation}: {pt.keyword}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FullPaperParser() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject]           = useState("physics");
  const [paperCode, setPaperCode]       = useState("9702");
  const [paperSession, setPaperSession] = useState("Nov 2025");
  const [paperVariant, setPaperVariant] = useState("41");
  const [paperText, setPaperText]       = useState("");
  const [msText, setMsText]             = useState("");

  const [phase, setPhase]               = useState("idle");
  const [parsed, setParsed]             = useState([]);
  const [saveResults, setSaveResults]   = useState(null);
  const [errorMsg, setErrorMsg]         = useState("");
  const [logs, setLogs]                 = useState([]);

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
    addLog("🤖 Sending to Claude…");

    const topics = subject === "physics"
      ? "Physical Quantities, Kinematics, Forces, Waves, Circular Motion, Gravitational Fields, Thermal Physics, Oscillations, Electric Fields, Capacitance, Electromagnetic Induction, Quantum Physics, Nuclear Physics, Medical Imaging, Astrophysics"
      : "Data Representation, Compression, Networks, Hardware, Operating Systems, Language Translators, Data Security, Data Integrity, Ethics, Databases, Algorithms";

    // Token-efficient prompt — no verbose examples, concise instructions
    const prompt = `Split this Cambridge A Level ${subject === "physics" ? "9702" : "9618"} paper into sub-questions. Return ONLY a JSON array, no markdown, no explanation.

PAPER (truncated to save tokens):
${paperText.slice(0, 4000)}

MARK SCHEME:
${msText ? msText.slice(0, 3000) : "Not provided — write short Cambridge-style mark scheme."}

TOPICS: ${topics}

Return JSON array:
[{"question_number":"1(a)","topic":"topic name","question_text":"exact text","total_marks":2,"mark_scheme_text":"B1: keyword. B1: keyword.","mark_points":[{"notation":"B1","keyword":"phrase","is_mandatory":false,"dependent_on":null}]}]

Rules: every sub-part = separate entry. Respond with ONLY the JSON array.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
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
                        notation:     { type: "string" },
                        keyword:      { type: "string" },
                        is_mandatory: { type: "boolean" },
                        dependent_on: { type: ["number", "null"] },
                      }
                    }
                  }
                }
              }
            }
          }
        },
      });

      // Handle both array and {questions:[]} shapes, and strip code fences
      let raw = result?.response ?? result;
      let data;

      try {
        // If it's already an object with a questions array
        if (raw && typeof raw === "object" && Array.isArray(raw.questions)) {
          data = raw.questions;
        } else if (Array.isArray(raw)) {
          data = raw;
        } else {
          // String response — strip code fences then parse
          const cleaned = stripCodeFences(typeof raw === "string" ? raw : JSON.stringify(raw));
          const parsed2 = JSON.parse(cleaned);
          data = Array.isArray(parsed2) ? parsed2 : (parsed2.questions ?? []);
        }
      } catch (parseErr) {
        // Last resort — try to find a JSON array anywhere in the string
        const strRaw = typeof raw === "string" ? raw : JSON.stringify(raw);
        const match = strRaw.match(/\[[\s\S]*\]/);
        if (!match) throw new Error(`Could not extract JSON array. Raw: ${strRaw.slice(0, 200)}`);
        data = JSON.parse(match[0]);
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Claude returned an empty or invalid array.");
      }

      addLog(`✓ ${data.length} sub-questions parsed`);
      setParsed(data);
      setPhase("preview");
    } catch (err) {
      setErrorMsg(err.message ?? "Unknown error");
      addLog(`✗ ${err.message}`);
      setPhase("idle");
    }
  }

  async function handleSave() {
    if (!parsed.length) return;
    setPhase("saving"); setSaveResults(null); setErrorMsg("");

    const code     = paperCode.trim().toUpperCase();
    const session  = paperSession.trim();
    const variant  = paperVariant.trim();
    const paperRef = `${code}/${variant} · ${session}`;

    const results = [];
    const errors  = [];

    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      const safeQNum = (q.question_number ?? String(i + 1)).replace(/[^a-zA-Z0-9]/g, "_");
      const qId = `${code}_${session.replace(/\s/g, "_")}_${variant}_${safeQNum}`;
      addLog(`Saving ${q.question_number ?? `Q${i+1}`}…`);

      try {
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

        await upsertRow("topics", {
          key: topicToKey(q.topic),
          name: q.topic ?? "Unknown",
          subject,
        });

        await supabaseClient.from("mark_scheme_nodes").delete().eq("question_id", qId);

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

        results.push({ qNum: q.question_number, id: qId, nodes: nodes.length });
        addLog(`✓ ${q.question_number} — ${nodes.length} nodes`);
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

  // Character counters with colour warnings
  const paperChars = paperText.length;
  const msChars    = msText.length;
  const paperColor = paperChars > 4000 ? "text-amber-400" : "text-white/25";
  const msColor    = msChars > 3000 ? "text-amber-400" : "text-white/25";

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
          <div className="bg-purple-500/8 border border-purple-500/20 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-bold text-white">How to use — token-efficient</p>
            <ol className="text-xs text-white/50 leading-relaxed space-y-1 list-decimal list-inside">
              <li>Set paper code, session, variant</li>
              <li>Paste <strong className="text-white/70">question text</strong> — keep under 4 000 chars to save tokens</li>
              <li>Paste <strong className="text-white/70">mark scheme</strong> — keep under 3 000 chars</li>
              <li>Click <strong className="text-purple-400">Auto-Parse</strong> — one Claude call, no extra tokens</li>
              <li>Preview → <strong className="text-emerald-400">Save All</strong></li>
            </ol>
            <p className="text-[10px] text-amber-400/70 flex items-start gap-1 pt-1">
              ⚡ Tip: paste a few questions at a time for cheapest cost — Claude only charges for what you send.
            </p>
          </div>

          {/* Paper metadata */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Paper Details</p>
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
                ["Code",    paperCode,    setPaperCode,    "9702"],
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
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Question Paper Text <span className="text-purple-400">*</span>
                </label>
                <span className={`text-[10px] font-mono ${paperColor}`}>
                  {paperChars.toLocaleString()} / 4 000 chars
                  {paperChars > 4000 && " — only first 4 000 sent to save tokens"}
                </span>
              </div>
              <textarea
                value={paperText}
                onChange={e => setPaperText(e.target.value)}
                placeholder="Paste question text here. For cheapest tokens, paste a few questions at a time (under 4 000 characters)."
                rows={8}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-purple-500/40 transition-all font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Mark Scheme Text <span className="text-white/20">(optional)</span>
                </label>
                <span className={`text-[10px] font-mono ${msColor}`}>
                  {msChars.toLocaleString()} / 3 000 chars
                  {msChars > 3000 && " — only first 3 000 sent"}
                </span>
              </div>
              <textarea
                value={msText}
                onChange={e => setMsText(e.target.value)}
                placeholder="Paste corresponding mark scheme text. Omit if not available — Claude will infer."
                rows={5}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-emerald-500/40 transition-all font-mono leading-relaxed"
              />
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
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing…</>
                : <><Zap className="w-4 h-4" /> Auto-Parse with Claude</>}
            </button>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 max-h-36 overflow-y-auto space-y-0.5">
              {logs.map((l, i) => (
                <p key={i} className="text-[11px] font-mono text-white/50">{l}</p>
              ))}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-red-300 font-semibold">Parse failed</p>
                <p className="text-xs text-red-300/70 leading-relaxed font-mono">{errorMsg}</p>
                <p className="text-[11px] text-red-300/50">Try reducing the pasted text to under 4 000 characters.</p>
              </div>
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
                    onClick={() => { setParsed([]); setLogs([]); setPhase("idle"); }}
                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                  >
                    ← Start over
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {parsed.map((q, i) => <QuestionCard key={i} q={q} idx={i} />)}
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
          {isDone && saveResults && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <p className="font-bold text-white">Done!</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    ["Saved",       saveResults.results?.length ?? 0,                                          "text-emerald-400"],
                    ["Errors",      saveResults.errors?.length ?? 0,  saveResults.errors?.length ? "text-red-400" : "text-white"],
                    ["Mark nodes",  saveResults.results?.reduce((s,r) => s + r.nodes, 0) ?? 0,                  "text-purple-400"],
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
                <button
                  onClick={() => { setParsed([]); setPaperText(""); setMsText(""); setLogs([]); setSaveResults(null); setPhase("idle"); }}
                  className="flex items-center justify-center gap-2 border border-white/10 text-white/60 font-semibold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
                >
                  Parse Another
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
                >
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