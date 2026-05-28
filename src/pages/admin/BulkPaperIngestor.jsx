import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Zap, CheckCircle2, XCircle, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const DEV_EMAIL = "reaganmungoma@gmail.com";

const SUBJECT_OPTIONS = [
  { value: "physics", label: "Physics (9702)" },
  { value: "cs", label: "Computer Science (9618)" },
];

function FileDropZone({ label, accept, file, onFile, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
        dragging
          ? "border-primary bg-primary/10"
          : file
            ? "border-green-500/50 bg-green-500/5"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
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
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-all"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Q{r.qNum} — {r.topics[0] ?? "Unknown"}</p>
            <p className="text-[11px] text-white/40">{r.questionId} · {r.totalMarks} marks · {r.nodeCount} nodes</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/25" /> : <ChevronDown className="w-4 h-4 text-white/25" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-white/5 pt-2 space-y-1">
          <p className="text-[11px] text-white/50">Topics: <span className="text-white/70">{r.topics.join(", ")}</span></p>
          <p className="text-[11px] text-white/50">Nodes generated: <span className="text-white/70">{r.nodeCount}</span></p>
          <p className="text-[11px] text-white/50">Total marks: <span className="text-white/70">{r.totalMarks}</span></p>
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
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? "");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | extracting | processing | done | error
  const [progress, setProgress] = useState({ step: "", pct: 0 });
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [qpText, setQpText] = useState("");
  const [msText, setMsText] = useState("");
  const [useManualText, setUseManualText] = useState(false);

  if (user?.email !== DEV_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <p className="text-sm text-white/30">Access restricted.</p>
      </div>
    );
  }

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result.split(",")[1];
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function extractText(file) {
    const b64 = await fileToBase64(file);
    const res = await fetch("/api/extract-pdf-text", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ base64: b64, filename: file.name }),
    });
    if (!res.ok) throw new Error(`PDF extraction failed: ${await res.text()}`);
    const data = await res.json();
    if (data.isLikelyScanned) {
      throw new Error(`"${file.name}" appears to be a scanned PDF with no embedded text. Please use a text-based PDF or paste the text manually.`);
    }
    return data.text;
  }

  async function handleRun() {
    if (!supabaseUrl || !supabaseServiceKey) {
      setErrorMsg("Please provide your Supabase URL and Service Role key.");
      return;
    }

    setPhase("extracting");
    setErrorMsg("");
    setResult(null);

    try {
      let qpTextFinal = qpText;
      let msTextFinal = msText;

      if (!useManualText) {
        if (!qpFile) { setErrorMsg("Please upload a Question Paper PDF."); setPhase("idle"); return; }

        setProgress({ step: "Extracting question paper text…", pct: 10 });
        qpTextFinal = await extractText(qpFile);

        if (msFile) {
          setProgress({ step: "Extracting mark scheme text…", pct: 25 });
          msTextFinal = await extractText(msFile);
        }
      } else {
        if (!qpTextFinal.trim()) { setErrorMsg("Please paste the question paper text."); setPhase("idle"); return; }
      }

      const filename = qpFile?.name ?? (subject === "physics" ? "9702_s25_qp_42.pdf" : "9618_w23_qp_13.pdf");

      setPhase("processing");
      setProgress({ step: "AI is splitting and classifying questions…", pct: 40 });

      const res = await fetch("/api/ingest-paper", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionPaperText: qpTextFinal,
          markSchemeText: msTextFinal,
          questionPaperFilename: filename,
          markSchemeFilename: msFile?.name ?? "",
          subject,
          supabaseUrl,
          supabaseServiceKey,
        }),
      });

      setProgress({ step: "Inserting into Supabase…", pct: 85 });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();
      setResult(data);
      setPhase("done");
      setProgress({ step: "Complete!", pct: 100 });
    } catch (err) {
      setErrorMsg(err.message ?? String(err));
      setPhase("error");
    }
  }

  const isRunning = phase === "extracting" || phase === "processing";

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

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white">Zero-friction Paper Splitter</h1>
            <p className="text-xs text-white/40 leading-relaxed">
              Upload a full Cambridge Question Paper + Mark Scheme. The AI splits, classifies, and seeds all questions and atomic mark-scheme nodes into Supabase automatically.
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Subject</p>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECT_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSubject(s.value)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    subject === s.value
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-white/[0.03] border-white/8 text-white/40 hover:border-white/15"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input mode toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseManualText(false)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                !useManualText ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/8 text-white/30 hover:border-white/15"
              }`}
            >
              📄 Upload PDFs
            </button>
            <button
              onClick={() => setUseManualText(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                useManualText ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/8 text-white/30 hover:border-white/15"
              }`}
            >
              ✍️ Paste Text
            </button>
          </div>

          {!useManualText ? (
            <div className="space-y-3">
              <FileDropZone
                label="Question Paper PDF"
                accept=".pdf"
                file={qpFile}
                onFile={setQpFile}
                hint="e.g. 9702_s25_qp_42.pdf — drag & drop or click"
              />
              <FileDropZone
                label="Mark Scheme PDF (optional but recommended)"
                accept=".pdf"
                file={msFile}
                onFile={setMsFile}
                hint="e.g. 9702_s25_ms_42.pdf"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-white/40">Question Paper Text</p>
                <p className="text-[10px] text-white/25">
                  Also set the filename below so the system can parse paper metadata (e.g. 9702_s25_qp_42.pdf)
                </p>
                <input
                  placeholder="Filename (e.g. 9702_s25_qp_42.pdf)"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 mb-2"
                  onChange={e => setQpFile({ name: e.target.value })}
                />
                <textarea
                  value={qpText}
                  onChange={e => setQpText(e.target.value)}
                  placeholder="Paste the full question paper text here…"
                  rows={8}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-white/40">Mark Scheme Text (optional)</p>
                <textarea
                  value={msText}
                  onChange={e => setMsText(e.target.value)}
                  placeholder="Paste the full mark scheme text here…"
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>
            </div>
          )}

          {/* Supabase credentials */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Supabase Credentials</p>
            <p className="text-[11px] text-white/25 leading-relaxed">
              Use your <strong className="text-white/40">Service Role</strong> key (not the anon key) — required for direct table writes.
            </p>
            <input
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40"
            />
            <input
              value={supabaseServiceKey}
              onChange={e => setSupabaseServiceKey(e.target.value)}
              placeholder="Service Role Key (eyJ…)"
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40"
            />
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <p className="text-sm text-amber-300 font-semibold">{progress.step}</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${progress.pct}%` }} />
              </div>
            </div>
          )}

          {/* Error */}
          {(phase === "error" || errorMsg) && (
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
                  <p className="font-bold text-white">Ingestion Complete</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Questions found", result.questionsFound],
                    ["Processed", result.questionsProcessed],
                    ["Errors", result.errors?.length ?? 0],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-white">{val}</p>
                      <p className="text-[10px] text-white/35">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/40 font-mono">Paper: {result.paperId}</p>
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

              {result.results?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Questions seeded</p>
                  {result.results.map(r => <ResultRow key={r.questionId} r={r} />)}
                </div>
              )}
            </div>
          )}

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning || (!qpFile && !qpText.trim())}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            ) : phase === "done" ? (
              <><Zap className="w-4 h-4" /> Run Again</>
            ) : (
              <><Zap className="w-4 h-4" /> Split, Classify & Ingest</>
            )}
          </button>

          {/* SQL hint */}
          <details className="group">
            <summary className="text-[11px] text-white/25 cursor-pointer hover:text-white/40 transition-colors list-none flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              View required SQL migration
            </summary>
            <pre className="mt-3 bg-white/[0.03] border border-white/8 rounded-xl p-4 text-[10px] font-mono text-white/50 overflow-x-auto whitespace-pre leading-relaxed">
{`-- Run this once in Supabase SQL Editor

-- 1. Extend questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS mark_scheme_text text;

-- 2. Topics table
CREATE TABLE IF NOT EXISTS topics (
  key  text PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL DEFAULT 'physics'
);

-- 3. Junction table
CREATE TABLE IF NOT EXISTS question_topics (
  question_id text REFERENCES questions(id) ON DELETE CASCADE,
  topic_key   text REFERENCES topics(key)   ON DELETE CASCADE,
  PRIMARY KEY (question_id, topic_key)
);

-- 4. mark_scheme_nodes (if not already created)
CREATE TABLE IF NOT EXISTS mark_scheme_nodes (
  id           bigserial PRIMARY KEY,
  question_id  text REFERENCES questions(id) ON DELETE CASCADE,
  node_index   integer NOT NULL,
  mark_type    text NOT NULL DEFAULT 'B1',
  keyword      text NOT NULL,
  aliases      text[] DEFAULT '{}',
  is_mandatory boolean DEFAULT false,
  dependent_on integer,
  max_marks    integer DEFAULT 1
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