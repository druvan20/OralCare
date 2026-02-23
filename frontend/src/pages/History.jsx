import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistory } from "../services/api";
import { API_BASE } from "../config";
import { History as HistoryIcon, AlertCircle, Inbox, RefreshCw, WifiOff, BarChart3, TrendingUp, ArrowRight, Activity, Calendar, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function getErrorMessage(err) {
  return err.friendlyMessage || err.response?.data?.message || err.message || "Something went wrong.";
}

function computeStats(history) {
  const total = history.length;
  const highRisk = history.filter((h) => h.final_decision === "Malignant" || (h.final_score != null && h.final_score >= 0.55)).length;
  const lowRisk = total - highRisk;
  const scores = history.map((h) => (h.final_score != null ? h.final_score * 100 : 0)).filter(Boolean);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
  return { total, highRisk, lowRisk, avgScore };
}

function chartData(history) {
  return history
    .slice()
    .reverse()
    .slice(-20)
    .map((item, i) => ({
      index: i + 1,
      label: item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `#${i + 1}`,
      score: item.final_score != null ? Math.round(item.final_score * 100) : 0,
      highRisk: item.final_decision === "Malignant" || (item.final_score != null && item.final_score >= 0.55),
    }));
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const isNetworkError = error && (error.includes("Cannot reach") || error.includes("server") || error.includes("unavailable"));
  const stats = computeStats(history);
  const chart = chartData(history);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm uppercase tracking-widest mb-2">
            <HistoryIcon className="h-4 w-4" />
            Archive
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Records Portal</h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg">
            Encrypted screening history and longitudinal AI analytical trends.
          </p>
        </div>
        {!loading && !error && history.length > 0 && (
          <button onClick={() => navigate("/predict")} className="btn-primary group">
            Analyze New File <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-card flex flex-col items-center justify-center py-32">
          <div className="h-16 w-16 border-4 border-violet-600/20 border-t-violet-600 animate-spin rounded-full mb-8"></div>
          <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
        </div>
      ) : error ? (
        <div className="glass-card border-red-500/20 bg-red-500/5 flex flex-col items-center text-center p-12">
          <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
            {isNetworkError ? <WifiOff className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Interface Disrupted</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm">{error}</p>
          {!error.includes("Token") && (
            <button onClick={load} className="btn-secondary gap-2 px-8">
              <RefreshCw className="h-5 w-5" /> Reboot Session
            </button>
          )}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-32 text-center">
          <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-8">
            <Inbox className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Vault Empty</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-10">No AI-processed screenings detected within this identity profile.</p>
          <button onClick={() => navigate("/predict")} className="btn-primary px-10 py-4 text-lg">
            Start Primary Screening
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Analyses", value: stats.total, icon: Activity, color: "violet" },
              { label: "Critical", value: stats.highRisk, icon: AlertCircle, color: "red" },
              { label: "Nominal", value: stats.lowRisk, icon: ShieldAlert, color: "emerald" },
              { label: "Avg Factor", value: `${stats.avgScore}%`, icon: TrendingUp, color: "indigo" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 relative overflow-hidden group hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all">
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${stat.color}-600`}>
                  <stat.icon className="h-12 w-12" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-4xl font-black tracking-tight text-slate-900 dark:text-white`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 glass-card">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                  Analytical Trends
                </h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" mirror hide />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: 'white' }} />
                    <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={24}>
                      {chart.map((entry, i) => (
                        <Cell key={i} fill={entry.highRisk ? "#f43f5e" : "#7c3aed"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card flex flex-col justify-center">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-violet-600/10 mx-auto flex items-center justify-center text-violet-600 mb-6 font-black text-2xl">
                  {stats.avgScore}%
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">Identity Health Index</h4>
                <p className="text-sm text-slate-500 font-medium px-4">Aggregated AI scoring across all processed digital specimens.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Processing Logs
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="text-left py-6 px-8">Specimen Timestamp</th>
                    <th className="text-left py-6 px-8">Diagnostic Result</th>
                    <th className="text-right py-6 px-8">AI Score</th>
                    <th className="text-right py-6 px-8">Confidence Vector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-violet-600/5 group transition-colors cursor-pointer"
                      onClick={() => {
                        sessionStorage.setItem("predictionResult", JSON.stringify(item));
                        navigate("/predict/results");
                      }}
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`inline-flex items-center rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${item.final_decision === "Malignant" || (item.final_score != null && item.final_score >= 0.55)
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}>
                          {item.final_decision}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <span className="text-lg font-black text-slate-900 dark:text-white italic">
                          {item.final_score != null ? (item.final_score * 100).toFixed(1) : "—"}%
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          <span className="text-[12px] font-bold">
                            {item.image_confidence != null ? (item.image_confidence * 100).toFixed(1) + "%" : "—"}
                          </span>
                          <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-600 transition-all"
                              style={{ width: `${(item.image_confidence || 0) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
