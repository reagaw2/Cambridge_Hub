/**
 * SchemeWhispererAdmin — one-click ingestion of all question banks
 * into the mark_scheme_nodes Supabase table.
 * Only accessible to reaganmungoma@gmail.com.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, CheckCircle2, XCircle, Loader2, Database } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { ingestQuestionBank } from "@/lib/schemeWhisperer";

// Physics banks
import { GRAVITATIONAL_QUESTIONS } from "@/lib/gravitationalBank";
import { THERMAL_QUESTIONS } from "@/lib/thermalBank";
import { QUANTUM_QUESTIONS } from "@/lib/quantumBank";
import { NUCLEAR_QUESTIONS } from "@/lib/nuclearBank";
import { ELECTRIC_QUESTIONS } from "@/lib/electricBank";
import { EM_INDUCTION_QUESTIONS } from "@/lib/emInductionBank";
import { ASTROPHYSICS_QUESTIONS } from "@/lib/astrophysicsBank";
import { CIRCULAR_MOTION_QUESTIONS } from "@/lib/circularMotionBank";
import { OSCILLATIONS_QUESTIONS as OSC_BANK } from "@/lib/oscillationsBank";
import { KINEMATICS_QUESTIONS } from "@/lib/kinematicsBank";
import { FORCES_QUESTIONS } from "@/lib/forcesBank";
import { WAVES_QUESTIONS } from "@/lib/wavesBank";
import { MEDICAL_IMAGING_QUESTIONS } from "@/lib/medicalImagingBank";
import { PHYSICAL_QUANTITIES_QUESTIONS } from "@/lib/physicalQuantitiesBank";
import { CAPACITANCE_QUESTIONS } from "@/lib/capacitanceBank";

// CS banks
import { OS_QUESTIONS } from "@/lib/csOSBank";
import { LT_QUESTIONS } from "@/lib/csLTBank";
import { DATA_REP_QUESTIONS } from "@/lib/csDataRepBank";
import { COMPRESSION_QUESTIONS } from "@/lib/csCompressionBank";
import { COMP_QUESTIONS } from "@/lib/csCompAndCompBank";
import { ETHICS_QUESTIONS } from "@/lib/csEthicsBank";
import { NETWORKS_QUESTIONS } from "@/lib/csNetworksBank";
import { DATA_SECURITY_QUESTIONS } from "@/lib/csDataSecurityBank";
import { DATA_INTEGRITY_QUESTIONS } from "@/lib/csDataIntegrityBank";

const DEV_EMAIL = "reaganmungoma@gmail.com";

const PHYSICS_BANKS = [
  { name: "Gravitational Fields", questions: GRAVITATIONAL_QUESTIONS },
  { name: "Thermal Physics", questions: THERMAL_QUESTIONS },
  { name: "Quantum Physics", questions: QUANTUM_QUESTIONS },
  { name: "Nuclear Physics", questions: NUCLEAR_QUESTIONS },
  { name: "Electric Fields", questions: ELECTRIC_QUESTIONS },
  { name: "EM Induction", questions: EM_INDUCTION_QUESTIONS },
  { name: "Astrophysics", questions: ASTROPHYSICS_QUESTIONS },
  { name: "Circular Motion", questions: CIRCULAR_MOTION_QUESTIONS },
  { name: "Kinematics", questions: KINEMATICS_QUESTIONS },
  { name: "Forces", questions: FORCES_QUESTIONS },
  { name: "Medical Imaging", questions: MEDICAL_IMAGING_QUESTIONS },
  { name: "Physical Quantities", questions: PHYSICAL_QUANTITIES_QUESTIONS },
];

const CS_BANKS = [
  { name: "Operating Systems", questions: OS_QUESTIONS },
  { name: "Language Translators", questions: LT_QUESTIONS },
  { name: "Data Representation", questions: DATA_REP_QUESTIONS },
  { name: "Compression", questions: COMPRESSION_QUESTIONS },
  { name: "Computers & Components", questions: COMP_QUESTIONS },
  { name: "Ethics & Ownership", questions: ETHICS_QUESTIONS },
  { name: "Networks", questions: NETWORKS_QUESTIONS },
  { name: "Data Security", questions: DATA_SECURITY_QUESTIONS },
  { name: "Data Integrity", questions: DATA_INTEGRITY_QUESTIONS },
];

function BankRow({ bank, result, running }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2">
        {running && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />}
        {result?.done && !result.errors?.length && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
        {result?.done && result.errors?.length > 0 && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
        {!running && !result && <div className="w-3.5 h-3.5 rounded-full border border-border/40 shrink-0" />}
        <span className="text-sm text-foreground">{bank.name}</span>
        <span className="text-[11px] text-muted-foreground font-mono">({bank.questions?.length ?? 0} Qs)</span>
      </div>
      {result?.done && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-green-400">{result.ingested} seeded</span>
          {result.errors?.length > 0 && (
            <span className="text-[11px] font-mono text-red-400">{result.errors.length} errors</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchemeWhispererAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [currentBank, setCurrentBank] = useState(null);
  const [results, setResults] = useState({});
  const [totalIngested, setTotalIngested] = useState(0);
  const [done, setDone] = useState(false);

  if (user?.email !== DEV_EMAIL) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Access restricted.</p>
      </div>
    );
  }

  async function runIngestion() {
    setRunning(true);
    setDone(false);
    setResults({});
    let total = 0;

    const allBanks = [
      ...PHYSICS_BANKS.map(b => ({ ...b, subject: "physics" })),
      ...CS_BANKS.map(b => ({ ...b, subject: "cs" })),
    ];

    for (const bank of allBanks) {
      setCurrentBank(bank.name);
      const result = await ingestQuestionBank(bank.questions ?? [], bank.subject);
      total += result.ingested;
      setResults(prev => ({
        ...prev,
        [bank.name]: { ...result, done: true },
      }));
    }

    setTotalIngested(total);
    setCurrentBank(null);
    setRunning(false);
    setDone(true);
  }

  const allBanks = [
    ...PHYSICS_BANKS.map(b => ({ ...b, subject: "physics" })),
    ...CS_BANKS.map(b => ({ ...b, subject: "cs" })),
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate("/")} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">Scheme Whisperer</span>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-[11px] text-primary font-mono">Admin</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5 p-4 pt-6">

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg font-bold text-foreground">Atomic Node Ingestion</h1>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Parses all question banks and seeds <code className="font-mono text-primary/80 bg-primary/10 px-1 rounded">mark_scheme_nodes</code> in Supabase. Safe to re-run — uses upsert.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{allBanks.reduce((s, b) => s + (b.questions?.length ?? 0), 0)}</p>
              <p className="text-[10px] text-muted-foreground">Total Qs</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{allBanks.length}</p>
              <p className="text-[10px] text-muted-foreground">Banks</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${done ? "text-green-400" : "text-foreground"}`}>{totalIngested}</p>
              <p className="text-[10px] text-muted-foreground">Seeded</p>
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={runIngestion}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {running ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting {currentBank}…</>
            ) : done ? (
              <><CheckCircle2 className="w-4 h-4" /> Done — Re-run Ingestion</>
            ) : (
              <><Zap className="w-4 h-4" /> Run Ingestion</>
            )}
          </button>

          {done && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-semibold text-green-400">
                ✓ {totalIngested} questions seeded into Supabase
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                mark_scheme_nodes table is ready for the grading engine
              </p>
            </div>
          )}

          {/* Physics banks */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Physics Banks</p>
            <div className="bg-card border border-border rounded-xl px-4 divide-y divide-border/30">
              {PHYSICS_BANKS.map(bank => (
                <BankRow
                  key={bank.name}
                  bank={bank}
                  result={results[bank.name]}
                  running={running && currentBank === bank.name}
                />
              ))}
            </div>
          </div>

          {/* CS banks */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Computer Science Banks</p>
            <div className="bg-card border border-border rounded-xl px-4 divide-y divide-border/30">
              {CS_BANKS.map(bank => (
                <BankRow
                  key={bank.name}
                  bank={bank}
                  result={results[bank.name]}
                  running={running && currentBank === bank.name}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}