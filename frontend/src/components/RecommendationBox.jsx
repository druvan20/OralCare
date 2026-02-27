import { AlertTriangle, CheckCircle } from "lucide-react";

export default function RecommendationBox({ decision }) {
  const isHigh =
    decision.toLowerCase().includes("malignant") ||
    decision.toLowerCase().includes("high") ||
    decision.toLowerCase().includes("refer");

  return (
    <div
      className={`p-6 md:p-8 rounded-3xl md:rounded-[2rem] border-2 transition-all relative overflow-hidden ${isHigh
        ? "bg-red-500/5 border-red-500/20 text-red-900 dark:text-red-400"
        : "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-400"
        }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isHigh ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
          {isHigh ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
        </div>
        <h4 className="font-black uppercase tracking-widest text-xs italic">Clinical Recommendation</h4>
      </div>

      {isHigh ? (
        <p className="text-sm font-medium leading-relaxed italic border-l-2 border-red-500/30 dark:border-red-500/20 pl-6 text-slate-700 dark:text-red-400/80">
          High risk detected. Immediate consultation with an oral
          oncologist is strongly recommended for secondary telemetry verification.
        </p>
      ) : (
        <p className="text-sm font-medium leading-relaxed italic border-l-2 border-emerald-500/30 dark:border-emerald-500/20 pl-6 text-slate-700 dark:text-emerald-400/80">
          Low risk detected. Maintain standard oral hygiene protocols and schedule
          routine longitudinal check-ups for baseline monitoring.
        </p>
      )}
    </div>
  );
}
