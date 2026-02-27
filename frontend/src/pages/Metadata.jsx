import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { predictCancer } from "../services/predictService";
import Stepper from "../components/Stepper";
import { Loader2, BookOpen, ArrowRight, Sparkles, ClipboardCheck, Database, Binary, Activity } from "lucide-react";

const fields = [
  { key: "patientName", label: "Patient Identifier", type: "text", placeholder: "e.g. ALPHA-7 // John Doe" },
  { key: "tobacco", label: "Tobacco Use", isBoolean: true },
  { key: "alcohol", label: "Alcohol Consumption", isBoolean: true },
  { key: "betel", label: "Betel Quid Use", isBoolean: true },
  { key: "hpv", label: "HPV Infection", isBoolean: true },
  { key: "hygiene", label: "Poor Oral Hygiene", isBoolean: true },
  { key: "lesions", label: "Oral Lesions", isBoolean: true },
  { key: "bleeding", label: "Unexplained Bleeding", isBoolean: true },
  { key: "swallowing", label: "Difficulty Swallowing", isBoolean: true },
  { key: "patches", label: "White/Red Patches", isBoolean: true },
  { key: "family", label: "Family History", isBoolean: true },
  { key: "age", label: "Biological Age (Years)", type: "number" },
];

export default function Metadata() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const image = state?.image;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientName: "", tobacco: 0, alcohol: 0, betel: 0, hpv: 0, hygiene: 0, lesions: 0,
    bleeding: 0, swallowing: 0, patches: 0, family: 0, age: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;
    if (type === "number") {
      val = value === "" ? "" : Number(value);
      // Guardrails for Age
      if (name === "age" && val > 120) val = 120;
    }
    setForm({ ...form, [name]: val });
  };

  const setBooleanField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = async () => {
    if (!image) return alert("Specimen missing from stack. Telemetry aborted.");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("metadata", JSON.stringify(form));
      const result = await predictCancer(formData);
      const enrichedResult = { ...result, patientName: form.patientName };
      sessionStorage.setItem("predictionResult", JSON.stringify(enrichedResult));
      navigate("/predict/results");
    } catch (err) {
      console.error(err);
      alert("AI Protocol Failure: " + (err.response?.data?.error || "Unknown Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-violet-500 overflow-x-hidden transition-colors duration-500">
      {/* Immersive HUD Grid */}
      <div className="fixed inset-0 hud-grid opacity-20 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-10">
        <Activity className="h-full w-full text-violet-500" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Binary className="h-4 w-4 text-violet-500 animate-pulse" />
            <span className="terminal-accent text-[10px] font-black uppercase tracking-[0.5em] text-violet-400">
              Telemetry Calibration // Phase 02
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
            Patient<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Metadata</span>
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto italic">
            Synchronizing clinical data factors with pixel acquisition for 98.4% diagnostic precision.
          </p>
        </div>

        <div className="holographic border-violet-500/20 [clip-path:polygon(5%_0%,100%_0%,100%_100%,0%_100%,0%_5%)]">
          <Stepper step={2} />

          <div className="mt-12 p-8 lg:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-2xl bg-slate-50 dark:bg-violet-600/5 border border-slate-100 dark:border-white/5 mb-12">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-violet-500">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1 text-slate-700 dark:text-slate-300">Terminology Interface</h3>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Decrypt factor definitions for accurate telemetry. Ensure 0/1 binary values.</p>
                </div>
              </div>
              <Link to="/metadata-guide" state={{ fromMetadata: true, ...state }} className="btn-secondary py-3 px-8 text-[10px] font-black uppercase tracking-[0.2em] border-slate-200 dark:border-white/10">
                Launch Field Guide
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {fields.map((f) => (
                <div key={f.key} className={`holographic !p-6 border-slate-200 dark:border-white/5 group relative overflow-hidden transition-all hover:border-violet-500/40 ${f.key === "patientName" ? "md:col-span-2 lg:col-span-4 mb-4 bg-slate-50/50 dark:bg-white/5" : ""
                  }`}>
                  <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400 mb-3 group-focus-within:text-violet-400 transition-colors">
                    {f.label}
                  </label>

                  {f.isBoolean ? (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setBooleanField(f.key, 0)}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${form[f.key] === 0 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-105' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20'}`}
                      >
                        NO (0)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBooleanField(f.key, 1)}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${form[f.key] === 1 ? 'bg-violet-600 text-white scale-105' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20'}`}
                      >
                        YES (1)
                      </button>
                    </div>
                  ) : (
                    <input
                      type={f.type || "text"}
                      name={f.key}
                      value={form[f.key]}
                      onChange={handleChange}
                      placeholder={f.key === "age" ? "Enter your age" : f.placeholder}
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors terminal-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  )}

                  {f.key === "patientName" && (
                    <div className="mt-4 flex items-center gap-2">
                      <Database className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight italic">Persistent log identity (Optional)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="group relative w-full mt-12 md:mt-16 overflow-hidden bg-violet-600 text-white py-5 md:py-6 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 [clip-path:polygon(0%_0%,100%_0%,95%_100%,5%_100%)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse opacity-50" />
              <div className="flex items-center justify-center gap-4 relative z-10 text-lg">
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" /> RUNNING INFERENCE...
                  </>
                ) : (
                  <>
                    Execute Final Diagnostics <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
