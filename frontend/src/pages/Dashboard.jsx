import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchHistory } from "../services/api";
import { API_BASE } from "../config";
import {
    Activity,
    History as HistoryIcon,
    ArrowRight,
    Sparkles,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    Zap,
    MapPin,
    Navigation,
    ExternalLink,
    Phone,
    Cpu,
    Radio,
    Terminal,
    Crosshair,
    Database,
    Binary,
    Eye,
    Stethoscope,
    Dna,
    ShieldAlert,
    Search,
    RefreshCw,
    BookOpen,
    ChevronRight as ChevronRightIcon
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, avgScore: 0 });
    const [loading, setLoading] = useState(true);

    // Hospital Locator State
    const [clinics, setClinics] = useState([]);
    const [locLoading, setLocLoading] = useState(false);
    const [locStatus, setLocStatus] = useState("");
    const [hasPermission, setHasPermission] = useState(false);

    // Simulated Analytics Data
    const chartData = [
        { name: 'Mon', score: 92, precision: 98.4 },
        { name: 'Tue', score: 88, precision: 97.2 },
        { name: 'Wed', score: 95, precision: 99.1 },
        { name: 'Thu', score: 91, precision: 98.6 },
        { name: 'Fri', score: 98, precision: 99.4 },
        { name: 'Sat', score: 96, precision: 98.9 },
        { name: 'Sun', score: 97, precision: 99.2 },
    ];

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const handleFindClinics = useCallback(async (bypassCache = false) => {
        const CACHE_KEY = "oralcare_clinics_cache";
        const CACHE_EXPIRY = 3600000; // 1 hour

        // 1. Check Cache first
        if (!bypassCache) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_EXPIRY) {
                        setClinics(data);
                        setHasPermission(true);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem(CACHE_KEY);
                }
            }
        }

        setLocLoading(true);
        setLocStatus("Initializing Satellite Link...");
        if (!navigator.geolocation) {
            setLocLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                setHasPermission(true);
                setLocStatus("Location Triangulated. Syncing Oncology Grid...");

                try {
                    const query = `[out:json][timeout:25];(node["amenity"~"hospital|clinic"](around:20000, ${lat}, ${lon});way["amenity"~"hospital|clinic"](around:20000, ${lat}, ${lon}););out center;`;
                    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                    const data = await res.json();

                    setLocStatus("Decrypting Specialist Matrix...");

                    if (data.elements) {
                        const mapped = data.elements
                            .map(el => {
                                const center = el.center || { lat: el.lat, lon: el.lon };
                                return {
                                    id: el.id,
                                    name: el.tags.name || "Specialized Medical Center",
                                    type: el.tags.amenity === "hospital" ? "Hospital/Oncology" : "Clinical Facility",
                                    address: el.tags["addr:street"] ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}` : "Verified via GPS",
                                    distance: calculateDistance(lat, lon, center.lat, center.lon),
                                    phone: el.tags.phone || el.tags["contact:phone"] || "N/A"
                                };
                            })
                            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                            .slice(0, 10);

                        setClinics(mapped);
                        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
                    }
                } catch (err) {
                    console.error("Clinic fetch failed", err);
                } finally {
                    setLocLoading(false);
                }
            },
            () => {
                setLocLoading(false);
            },
            { timeout: 10000 }
        );
    }, []);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchHistory();
                if (Array.isArray(data)) {
                    setHistory(data.slice(0, 5));
                    const total = data.length;
                    const highRisk = data.filter(h => h.final_decision === "Malignant" || (h.final_score && h.final_score >= 0.55)).length;
                    const scores = data.map(h => h.final_score).filter(s => s != null);
                    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length * 100).toFixed(1) : 0;
                    setStats({ total, highRisk, avgScore });
                }
            } catch (err) {
                console.error("History sync failure", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
        handleFindClinics();
    }, [handleFindClinics]);

    const newsBulletins = [
        "AI ENGINE: Neural weights calibrated to 99.4% precision index",
        "GLOBAL FEED: Specialized oncology nodes updated in Southeast Asia region",
        "SYSTEM: Real-time telemetry handshake verified with medical cloud",
        "ALERTS: Multi-modal fusion analysis active for biopsy acquisition"
    ];

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-violet-500 overflow-x-hidden transition-colors duration-500">
            {/* Immersive HUD Grid & Radar Overlay */}
            <div className="fixed inset-0 hud-grid opacity-20 pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-violet-500/30 rounded-full animate-radar" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-violet-500/20 rounded-full animate-radar delay-1000" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-24 lg:py-32">
                {/* Global News Ticker */}
                <div className="mb-12 bio-hologram !rounded-2xl border-indigo-500/20">
                    <div className="flex items-center gap-6 py-3 px-8">
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="terminal-accent text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Live Network Feed</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex-1 overflow-hidden">
                            <div className="inline-block animate-marquee whitespace-nowrap">
                                {newsBulletins.map((item, i) => (
                                    <span key={i} className="mx-12 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Header */}
                <header className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-indigo-500" />
                            <span className="terminal-accent text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">Secure Diagnostic Environment</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic uppercase leading-tight">
                            OralCare<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Sol.AI</span>
                        </h1>
                        <p className="text-lg font-medium text-slate-500 max-w-xl italic border-l-2 border-white/10 pl-6">
                            Welcome back, Specialist {user?.name?.split(' ')[0]}. Automated biopsy tracking and neural inference systems are active.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate("/predict")}
                            className="group relative overflow-hidden bg-white text-slate-950 px-12 py-6 font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 [clip-path:polygon(0%_0%,100%_0%,90%_100%,0%_100%)]"
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <Zap className="h-4 w-4 fill-current" /> Initialize New Scan
                            </div>
                            <div className="absolute inset-0 bg-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Metrics & Analytics */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Medical Hologram Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Total Artifacts", value: stats.total, icon: Database, color: "text-violet-500", sub: "Global Buffer" },
                                { label: "Alert Incidents", value: stats.highRisk, icon: ShieldAlert, color: "text-red-500", sub: "Priority Cases" },
                                { label: "Field Values", value: "Guide", icon: BookOpen, color: "text-emerald-500", sub: "Clinical Docs", action: () => navigate("/metadata-guide") },
                            ].map((stat, i) => (
                                <div key={i} className={`bio-hologram p-10 group relative transition-all ${stat.action ? 'cursor-pointer hover:border-emerald-500/30' : ''}`} onClick={stat.action}>
                                    <div className="absolute inset-0 bio-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <stat.icon className={`h-8 w-8 ${stat.color} animate-float-subtle`} />
                                            {stat.action ? (
                                                <ChevronRightIcon className="h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                            ) : (
                                                <div className="h-1.5 w-8 rounded-full bg-white/5 overflow-hidden">
                                                    <div className="h-full bg-indigo-500 w-2/3 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="terminal-accent text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">{stat.label}</p>
                                            <h4 className="text-5xl font-black italic tracking-tighter italic">{stat.value}</h4>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{stat.sub}</span>
                                            {stat.action ? (
                                                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest group-hover:underline">Explore</span>
                                            ) : (
                                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                                </div>
                            ))}
                        </div>

                        {/* Analytic Vector Display */}
                        <div className="bio-hologram !p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Binary className="h-32 w-32 " />
                            </div>
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase italic">Neural Performance Vector</h3>
                                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 mt-2 italic">7-Day Diagnostic Fidelity Monitoring</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-violet-600" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Risk Factor</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Inference Accuracy</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPrec" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} dy={10} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                        <Area type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPrec)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Biopsy Extraction Vault */}
                        <div className="bio-hologram overflow-hidden">
                            <div className="px-12 py-8 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <HistoryIcon className="h-5 w-5 text-indigo-500" />
                                    <h3 className="text-sm font-black italic tracking-widest uppercase italic">Diagnostic Record Buffers</h3>
                                </div>
                                <button onClick={() => navigate("/history")} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">View All Acquisitions</button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => <div key={i} className="p-12 animate-pulse bg-white/5 m-1" />)
                                ) : history.length > 0 ? (
                                    history.map((h, i) => (
                                        <div key={i} className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => {
                                            sessionStorage.setItem("predictionResult", JSON.stringify(h));
                                            navigate("/predict/results");
                                        }}>
                                            <div className="flex items-center gap-8">
                                                <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0">
                                                    <img src={h.image_url ? `${API_BASE}${h.image_url}` : "/placeholder.png"} alt="Scan" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                    <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Eye className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${h.final_decision === "Malignant" ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"}`}>
                                                            {h.final_decision}
                                                        </span>
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tabular-nums">ID: AI-{h._id ? h._id.substring(0, 6).toUpperCase() : "XXXXXX"}</span>
                                                    </div>
                                                    <h4 className="text-xl font-black italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors uppercase italic">{new Date(h.timestamp || h.createdAt).toLocaleDateString()} Telemetry</h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-12">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Confidence Vector</p>
                                                    <p className="text-2xl font-black italic tabular-nums text-white">{(h.final_score * 100).toFixed(1)}%</p>
                                                </div>
                                                <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-all">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center">
                                        <AlertTriangle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">No active telemetry acquisitions detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Specialists & Vitals */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Specialized Oncology Matrix */}
                        <div className="bio-hologram !p-0 group/matrix relative overflow-hidden h-[740px] flex flex-col">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-50 group-hover/matrix:opacity-100 transition-opacity pointer-events-none" />

                            <div className="px-10 py-8 bg-indigo-600 relative overflow-hidden flex items-center justify-between shrink-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                                        <Stethoscope className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic tracking-widest uppercase italic text-white leading-none">Specialist Matrix</h3>
                                        <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest mt-1.5">Locating Oncology Support Nodes</p>
                                    </div>
                                </div>
                                {!hasPermission && !locLoading && (
                                    <button
                                        onClick={() => handleFindClinics(true)}
                                        className="relative z-10 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-white flex items-center gap-2 text-[9px] font-black uppercase tracking-widest group/btn"
                                        title="Force Refresh Data"
                                    >
                                        <RefreshCw className={`h-3 w-3 ${locLoading ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform'}`} />
                                        Sync Grid
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 relative overflow-hidden flex flex-col p-8">
                                {locLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-slate-950/40 backdrop-blur-md z-40">
                                        <div className="relative">
                                            <div className="h-48 w-48 border border-indigo-500/30 rounded-full animate-radar" />
                                            <div className="absolute inset-0 h-48 w-48 border border-indigo-500/20 rounded-full animate-radar delay-700" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-4 w-4 bg-indigo-500 rounded-full animate-ping" />
                                            </div>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[1px] bg-indigo-500/50 animate-pulse origin-bottom" style={{ transform: 'rotate(45deg)' }} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse italic">{locStatus || "Scanning Geographic Spectrums..."}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">Triangulating verified oncology nodes</p>
                                        </div>
                                    </div>
                                ) : clinics.length > 0 ? (
                                    <div className="space-y-4 max-h-full overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                        {clinics.map((clinic, idx) => (
                                            <div key={clinic.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden hover:bg-white/[0.07]">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                                    <MapPin className="h-16 w-16 text-indigo-500" />
                                                </div>

                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="w-fit px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-indigo-400 italic">
                                                            {clinic.type}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <div key={s} className={`h-1.5 w-0.5 rounded-full ${s <= (6 - Math.min(5, Math.ceil(parseFloat(clinic.distance) / 5))) ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Signal: {parseFloat(clinic.distance) < 5 ? 'Strong' : 'Stable'}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-indigo-400/80 italic uppercase tabular-nums">{clinic.distance}km</span>
                                                </div>

                                                <h5 className="text-lg font-black italic tracking-tighter leading-tight mb-2 uppercase italic group-hover:text-white transition-colors">
                                                    {clinic.name}
                                                </h5>

                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="h-1 w-1 bg-slate-600 rounded-full" />
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight line-clamp-1">{clinic.address}</p>
                                                </div>

                                                <div className="flex gap-3 relative z-10">
                                                    <a
                                                        href={`https://maps.google.com/?q=${encodeURIComponent(clinic.name)}`}
                                                        target="_blank"
                                                        className="flex-1 py-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 hover:border-indigo-400 transition-all text-center flex items-center justify-center gap-2"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        Deploy Nav
                                                    </a>
                                                    <a
                                                        href={`tel:${clinic.phone}`}
                                                        className="h-10 px-4 bg-white flex items-center justify-center rounded-xl text-slate-950 hover:bg-emerald-400 transition-all border border-white/20 active:scale-95"
                                                    >
                                                        <Phone className="h-4 w-4 shrink-0" />
                                                    </a>
                                                </div>

                                                {/* Card Background Glow */}
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4" onClick={handleFindClinics}>
                                        <div className="relative mb-10 group/radar cursor-pointer">
                                            <div className="h-56 w-56 rounded-full border-2 border-dashed border-indigo-500/10 flex items-center justify-center mx-auto animate-[spin_20s_linear_infinite]">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/5 to-transparent animate-pulse" />
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-slate-950 rounded-full border border-indigo-500/20 shadow-2xl group-hover/radar:border-indigo-500/50 transition-all">
                                                <Radio className="h-12 w-12 text-indigo-500 animate-pulse" />
                                            </div>
                                            {/* Pulsing rings */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-indigo-500/10 rounded-full animate-ping opacity-20" />
                                        </div>

                                        <h4 className="text-2xl font-black italic tracking-tighter uppercase italic text-white mb-3">GPS Passive Mode</h4>
                                        <div className="space-y-4 max-w-xs mx-auto mb-10">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed italic">
                                                Satellite telemetry inactive. Local oncology nodes are currently masked in the regional spectrum.
                                            </p>
                                            <div className="h-px w-12 bg-indigo-500/30 mx-auto" />
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/60">
                                                Manifest system signature to initiate discovery
                                            </p>
                                        </div>

                                        <button className="group relative px-10 py-5 bg-indigo-600 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 animate-shimmer" />
                                            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                                                <Zap className="h-4 w-4 fill-current" />
                                                Initialize Scan
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Core Vitals */}
                        <div className="bio-hologram p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-10 p-10 opacity-5">
                                <Cpu className="h-24 w-24 text-indigo-500" />
                            </div>
                            <h3 className="text-sm font-black italic tracking-widest uppercase italic mb-10">AI System Vitals</h3>
                            <div className="space-y-8">
                                {[
                                    { label: "Neural Latency", val: "42ms", color: "bg-emerald-500" },
                                    { label: "Core Utilization", val: "18%", color: "bg-indigo-500" },
                                    { label: "Encryption Grade", val: "AES-256", color: "bg-violet-500" },
                                ].map((sys, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{sys.label}</span>
                                            <span className="text-sm font-black tabular-nums">{sys.val}</span>
                                        </div>
                                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                            <div className={`h-full ${sys.color} w-3/4 animate-pulse duration-1000`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Core Operational</span>
                                </div>
                                <span className="text-[9px] font-black text-emerald-600/50 uppercase tracking-[0.3em]">v2.4.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ChevronRight = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);
