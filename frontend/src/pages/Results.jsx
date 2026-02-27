import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RiskRing from "../components/RiskRing";
import ResultSummary from "../components/ResultSummary";
import RecommendationBox from "../components/RecommendationBox";
import Stepper from "../components/Stepper";
import {
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Download,
  Share2,
  MapPin,
  Navigation,
  Sparkles,
  Search,
  ChevronRight,
  Phone,
  ExternalLink,
  Zap,
  Radio,
  Binary,
  Target,
  Activity,
  Award,
  Crosshair
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getHeuristicStage, generateMedicalReport } from "../utils/reportGenerator";

export default function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result] = useState(() => {
    const stored = sessionStorage.getItem("predictionResult");
    return stored ? JSON.parse(stored) : null;
  });

  const [clinics, setClinics] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [hasPermission, setHasPermission] = useState(false);

  // Risk heuristics
  const highRisk = result?.final_decision === "Malignant" || (result?.final_score ?? 0) >= 0.55;
  const riskPercent = Math.round((result?.final_score ?? 0) * 100);
  const stageInfo = result ? getHeuristicStage(result.final_score, result.final_decision) : null;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleFindClinics = () => {
    setLocLoading(true);
    setLocError("");

    if (!navigator.geolocation) {
      setLocError("GPS Sensor Offline");
      setLocLoading(false);
      provideDefaultClinics();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setHasPermission(true);

        try {
          const query = `[out:json];(node["amenity"~"hospital|clinic"](around:20000, ${lat}, ${lon});way["amenity"~"hospital|clinic"](around:20000, ${lat}, ${lon}););out center;`;
          const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const data = await res.json();

          if (data.elements && data.elements.length > 0) {
            const mapped = data.elements
              .map(el => {
                const center = el.center || { lat: el.lat, lon: el.lon };
                return {
                  id: el.id,
                  name: el.tags.name || "Specialized Medical Center",
                  type: el.tags.amenity === "hospital" ? "Hospital/Oncology" : "Clinical Facility",
                  address: el.tags["addr:street"] ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}` : "GPS Verified",
                  distance: calculateDistance(lat, lon, center.lat, center.lon),
                  phone: el.tags.phone || el.tags["contact:phone"] || "N/A"
                };
              })
              .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
              .slice(0, 9);

            setClinics(mapped);
          } else {
            provideDefaultClinics();
          }
        } catch (err) {
          provideDefaultClinics();
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        setLocLoading(false);
        provideDefaultClinics();
      }
    );
  };

  const provideDefaultClinics = () => {
    const data = [
      { id: 1, name: "City Oncology Center", type: "Hospital/Dept", address: "Medical District HQ", distance: "1.2", phone: "N/A" },
      { id: 2, name: "Oral Diagnostic Lab", type: "Cancer Hospital", address: "Bio-Tech Park", distance: "2.8", phone: "N/A" },
      { id: 3, name: "Maxillofacial Specialty", type: "Research Center", address: "North Wing Plaza", distance: "4.5", phone: "N/A" }
    ];
    setClinics(data);
  };

  const handleDownload = () => generateMedicalReport({ user, result, clinics });

  const handleShare = async () => {
    const shareData = {
      title: "Sol.AI Diagnostic Assessment",
      text: `Diagnostic Result: ${result.final_decision} (${riskPercent}% Risk).`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text} | ${shareData.url}`);
        alert("Telemetry copied to clipboard!");
      }
    } catch (err) { console.error(err); }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex shadow-inner items-center justify-center p-6 text-center">
        <div className="holographic max-w-sm p-12 border-violet-500/20">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-slate-900 dark:text-white">Telemetry Missing</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">No active diagnostic session detected in local buffers.</p>
          <button onClick={() => navigate("/predict")} className="w-full py-4 bg-violet-600 text-white font-black uppercase tracking-widest text-[10px] [clip-path:polygon(10%_0%,100%_0%,100%_100%,0%_100%)]">Initialize Scan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-violet-500 overflow-x-hidden transition-colors duration-500">
      {/* HUD Background Elements */}
      <div className="fixed inset-0 hud-grid opacity-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border-2 border-dashed border-violet-500/10 rounded-full animate-radar" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Results HUD Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Target className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="terminal-accent text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
              Inference Complete // Final Output
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter italic uppercase leading-none">
            Diagnostic<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Analysis</span>
          </h1>
          admissions          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto italic border-r-2 border-violet-500/30 pr-6">
            The SOL.AI engine has processed pixel acquisitions and clinical metadata. Assessment metrics verified.
          </p>
        </div>

        <div className="holographic border-violet-500/20 [clip-path:polygon(0%_0%,100%_0%,100%_95%,95%_100%,0%_100%)] mb-12">
          <Stepper step={3} />

          <div className="p-8 lg:p-16">
            {/* Primary Result Cockpit */}
            <div className={`relative rounded-3xl md:rounded-[3rem] p-6 md:p-12 border-2 transition-all overflow-hidden mb-12 ${highRisk
              ? "border-red-500/30 bg-red-500/5 neon-shadow-red"
              : "border-emerald-500/30 bg-emerald-500/5 neon-shadow-emerald"
              }`}>
              {/* Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-slate-200/20 dark:via-white/5 to-transparent h-40 w-full animate-scanline z-0" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className={`h-28 w-28 md:h-40 md:w-40 rounded-full flex items-center justify-center relative shrink-0 ${highRisk ? "bg-red-600 shadow-[0_0_60px_-10px_rgba(220,38,38,0.5)]" : "bg-emerald-600 shadow-[0_0_60px_-10px_rgba(16,185,129,0.5)]"
                  }`}>
                  <div className="absolute inset-4 border-2 border-white/20 rounded-full animate-radar opacity-30" />
                  <Award className="h-12 w-12 md:h-20 md:w-20 text-white" />
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="terminal-accent text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 italic">Core Status</span>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${highRisk ? "bg-red-500/20 text-red-500 dark:text-red-400 font-bold" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                      }`}>
                      {stageInfo?.stage !== "N/A" ? stageInfo.stage : "Optimal"}
                    </span>
                    <span className="px-4 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      SOL.AI Verified
                    </span>
                  </div>
                  <h2 className={`text-5xl md:text-8xl font-black italic tracking-tighter leading-none uppercase ${highRisk ? "text-red-500" : "text-emerald-500"
                    }`}>
                    {result.final_decision}
                  </h2>
                  <p className="text-xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed italic border-l-2 border-slate-200 dark:border-white/10 pl-6">
                    {stageInfo?.desc || `Neural patterns indicate no immediate malignant features. Maintain longitudinal observation protocols.`}
                  </p>
                </div>

                <div className="flex md:flex-col gap-4">
                  <button onClick={handleDownload} className="h-16 w-16 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl">
                    <Download className="h-7 w-7" />
                  </button>
                  <button onClick={handleShare} className="h-16 w-16 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center transition-all hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 hover:scale-110 shadow-2xl text-slate-400">
                    <Share2 className="h-7 w-7" />
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics HUD Grid */}
            <div className="grid gap-8 lg:grid-cols-12 mb-12">
              <div className="lg:col-span-5 holographic !p-6 md:!p-12 flex flex-col items-center justify-center border-white/5 group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity className="h-24 w-24 text-violet-500" />
                </div>
                <RiskRing value={riskPercent} />
                <p className="mt-8 terminal-accent text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Risk Confidence Factor</p>
              </div>
              <div className="lg:col-span-7 holographic !p-0 border-slate-200 dark:border-white/5 flex flex-col justify-center">
                <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between text-slate-900 dark:text-white">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-widest italic leading-none">Telemetry Vector</h3>
                  <Binary className="h-4 w-4 text-violet-500" />
                </div>
                <div className="p-6 md:p-10">
                  <ResultSummary result={result} />
                </div>
              </div>
            </div>

            {/* Referral Matrix - CRAZY HUD INTERACTION */}
            {highRisk && (
              <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-lg">
                      <Crosshair className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white">Care Network Matrix</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Connecting to verified specialist nodes</p>
                    </div>
                  </div>
                  {!hasPermission && clinics.length === 0 && (
                    <button onClick={handleFindClinics} className="group relative overflow-hidden bg-indigo-600 px-10 py-5 font-black uppercase tracking-[0.2em] text-[10px] disabled:opacity-50 [clip-path:polygon(0%_0%,100%_0%,90%_100%,0%_100%)]">
                      <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:-translate-y-1">
                        <Navigation className={`h-4 w-4 ${locLoading ? 'animate-spin' : ''}`} />
                        {locLoading ? "SCANNING SPECTRUM..." : "ACTIVATE GPS BEACON"}
                      </div>
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  {locLoading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-64 holographic animate-pulse border-slate-100 dark:border-white/5" />)
                  ) : clinics.length > 0 ? (
                    clinics.map((clinic) => (
                      <div key={clinic.id} className="holographic !p-8 border-slate-100 dark:border-white/10 group hover:border-violet-500 transition-all hover:-translate-y-2 relative overflow-hidden bg-slate-50 dark:bg-white/5">
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                          <span className="text-[9px] font-black italic tracking-[0.2em] bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300">{clinic.type}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">SCAN DIST: {clinic.distance} KM</span>
                        </div>
                        <h4 className="text-2xl font-black italic tracking-tighter leading-tight mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10 text-slate-900 dark:text-white uppercase italic">{clinic.name}</h4>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight mb-8 h-8 line-clamp-2 relative z-10">{clinic.address}</p>

                        <div className="flex flex-col gap-3 relative z-10">
                          <a href={`tel:${clinic.phone}`} className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 dark:hover:bg-slate-200 transition-all">
                            <Phone className="h-3 w-3" /> COMM LINK
                          </a>
                          <a href={`https://maps.google.com/?q=${encodeURIComponent(clinic.name)}`} target="_blank" className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                            MAPPING <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center holographic border-dashed border-2 border-slate-200 dark:border-white/5 rounded-[4rem] group" onClick={handleFindClinics}>
                      <Radio className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-6 group-hover:text-violet-500 transition-colors" />
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-slate-400 dark:text-slate-500">Awaiting GPS Handshake</h4>
                      <p className="max-w-xs mx-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-700">Deploy location protocol to manifest the nearest oncology nodes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-12">
              <RecommendationBox decision={result.final_decision} />
            </div>

            {/* Matrix Insights Board */}
            <div className="mt-12 holographic !p-12 border-violet-500/10 bg-slate-50 dark:bg-violet-600/5">
              <div className="flex items-center gap-5 mb-12">
                <div className="h-14 w-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
                  <Binary className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Heuristic Insights</h3>
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 mt-1">Staging Logic // SOL.AI V2</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase italic tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-3">
                    <div className="h-1.5 w-6 bg-violet-500" /> Vector Inputs
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-200 dark:border-white/5 pl-6">
                    Your assessment is calibrated against pixel-depth analysis and clinical telemetry streams:
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: "IMAGE FIDELITY", desc: "Pixel acquisition clarity index" },
                      { label: "METADATA VECTORS", desc: "11-factor clinical variable profile" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black tracking-widest text-slate-700 dark:text-white uppercase">{item.label}</p>
                          <p className="text-[10px] font-bold text-slate-500 italic mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase italic tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                    <div className="h-1.5 w-6 bg-indigo-500" /> Staging Heuristics
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { s: "STAGE I", r: "0-59%", i: "MONITORING" },
                      { s: "STAGE II", r: "60-69%", i: "BIOPSY REQ" },
                      { s: "STAGE III", r: "70-84%", i: "IMMEDIATE" },
                      { s: "STAGE IV", r: "85-100%", i: "URGENT" },
                    ].map((st, i) => (
                      <div key={i} className="flex items-center justify-between p-4 holographic !p-4 border-slate-100 dark:border-white/5 transition-all bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 group">
                        <div>
                          <span className="text-xs font-black italic tracking-tighter block text-slate-900 dark:text-white">{st.s}</span>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 tracking-widest">{st.i}</p>
                        </div>
                        <span className="text-[10px] font-black tabular-nums bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-500">{st.r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
              <button onClick={() => navigate("/dashboard")} className="group relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-16 py-6 font-black uppercase tracking-[0.3em] text-sm transition-all hover:scale-105 active:scale-95 [clip-path:polygon(10%_0%,100%_0%,90%_100%,0%_100%)] shadow-2xl shadow-indigo-500/10">
                Return to HUD <ArrowRight className="h-5 w-5 inline ml-3 group-hover:translate-x-2 transition-transform" />
              </button>
              <a href="https://who.int" target="_blank" className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 dark:text-slate-600 hover:text-violet-500 transition-colors flex items-center gap-3">
                <Search className="h-4 w-4" /> Academic Sources
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
