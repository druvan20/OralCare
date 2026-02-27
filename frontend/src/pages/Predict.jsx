import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ImageUploadCard from "../components/ImageUploadCard";
import Stepper from "../components/Stepper";
import { ArrowRight, Sparkles, Crosshair, Radio, ShieldCheck } from "lucide-react";

export default function Predict() {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (!image) return alert("Please upload a clinical specimen image first.");
    navigate("/predict/metadata", { state: { image } });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-violet-500 overflow-x-hidden transition-colors duration-500">
      {/* Immersive HUD Grid & Radar Overlay */}
      <div className="fixed inset-0 hud-grid opacity-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-violet-500/30 rounded-full animate-radar" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="terminal-accent text-[10px] font-black uppercase tracking-[0.5em] text-violet-400">
              Diagnostic Intake Phase // 01
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
            Specimen<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Acquisition</span>
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto italic border-l-2 border-violet-500/30 pl-6">
            Establishing high-fidelity pixel protocols for deep-learning oral analysis. Ensure balanced luminosity.
          </p>
        </div>

        <div className="holographic border-violet-500/20 [clip-path:polygon(0%_0%,100%_0%,100%_90%,90%_100%,0%_100%)]">
          <Stepper step={1} />
          <div className="mt-12 p-8 md:p-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <ImageUploadCard image={image} setImage={setImage} />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Layer-2 Encryption Active
                </div>
                <p className="text-[10px] text-slate-500 italic">Specimens are ephemeral and processed in-memory for maximum privacy.</p>
              </div>

              <button
                onClick={handleNext}
                disabled={!image}
                className="group relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 md:px-10 py-4 md:py-5 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 [clip-path:polygon(0%_0%,100%_0%,90%_100%,0%_100%)] shadow-xl shadow-indigo-500/10"
              >
                <div className="flex items-center justify-center gap-4 relative z-10">
                  Initialize Sync <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-6 px-8 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Optics: OK</span>
            </div>
            <div className="h-3 w-px bg-slate-200 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-violet-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Link: Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
