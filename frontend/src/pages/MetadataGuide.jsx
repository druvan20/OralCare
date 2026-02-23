import { useState } from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, ArrowLeft, CheckCircle, XCircle, Sparkles, ShieldCheck, HelpCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LANGUAGES, FIELD_IDS, RISK_WEIGHTS, fieldGuideContent } from "../content/fieldGuide";

export default function MetadataGuide() {
  const [searchParams] = useSearchParams();
  const langParam = searchParams.get("lang");
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(() => {
    const code = LANGUAGES.find((l) => l.code === langParam) ? langParam : "en";
    return code || "en";
  });
  const t = fieldGuideContent[lang] || fieldGuideContent.en;

  const chartData = FIELD_IDS.map((id) => ({
    name: t.fields[id].name,
    weight: RISK_WEIGHTS[id],
    id,
  })).sort((a, b) => b.weight - a.weight);

  const maxWeight = Math.max(...Object.values(RISK_WEIGHTS), 1);
  const barColor = (w) => (w >= 3 ? "rgb(139 92 246)" : w >= 2 ? "rgb(16 185 129)" : "rgb(100 116 139)");

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-500 transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-violet-500 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            {location.state?.fromMetadata ? "Return to Diagnosis" : "Exit to Dashboard"}
          </button>

          <div className="glass-card !p-2 !rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="pr-4">
              <label htmlFor="guide-lang" className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                {t.languageLabel}
              </label>
              <select
                id="guide-lang"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <header className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-black uppercase tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Knowledge Base
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              {t.oneMeans}
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 text-slate-500 dark:text-slate-400">
              <XCircle className="h-4 w-4" />
              {t.zeroMeans}
            </span>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.riskChartTitle}</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <XAxis type="number" domain={[0, maxWeight]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "currentColor" }}
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontWeight: 700 }}
                  />
                  <Bar dataKey="weight" radius={[0, 8, 8, 0]} maxBarSize={32}>
                    {chartData.map((entry) => (
                      <Cell key={entry.id} fill={barColor(entry.weight)} className="transition-all duration-500" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Statistical Risk Distribution</p>
              <HelpCircle className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Technical Definitions</h2>
          </div>

          <div className="grid gap-6">
            {FIELD_IDS.map((id) => {
              const f = t.fields[id];
              if (!f) return null;
              const weight = RISK_WEIGHTS[id];
              const getIcon = (fid) => {
                switch (fid) {
                  case "tobacco": return "🚬";
                  case "alcohol": return "🍷";
                  case "betel": return "🍃";
                  case "hpv": return "🔬";
                  case "hygiene": return "🪥";
                  case "lesions": return "🩹";
                  case "bleeding": return "🩸";
                  case "swallowing": return "👄";
                  case "patches": return "🎨";
                  case "family": return "🧬";
                  default: return "✨";
                }
              };

              return (
                <article
                  key={id}
                  className="glass-card hover:scale-[1.01] transition-transform duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getIcon(id)}</span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{f.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 font-bold text-xs">
                      Weight Factor: {weight}x
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[15px] font-medium leading-relaxed mb-6 italic border-l-4 border-violet-500/20 pl-4">{f.desc}</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <XCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Entry: 0</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{f.zero}</p>
                    </div>

                    <div className="group rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5 hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Entry: 1</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{f.one}</p>
                    </div>
                  </div>
                </article>
              );
            })}

            <article className="glass-card border-violet-500/20 bg-violet-500/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.ageLabel}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[15px] font-medium leading-relaxed">{t.ageDesc}</p>
              <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  Numeric Requirement: Enter absolute age in years
                </p>
              </div>
            </article>
          </div>
        </section>

        <div className="mt-16 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-primary flex items-center gap-3 px-10 py-5 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg">
              {location.state?.fromMetadata ? "Ready to Calibrate" : "Return to Hub"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
