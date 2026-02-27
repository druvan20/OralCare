export default function ResultSummary({ result }) {
  return (
    <div className="glass-card !bg-slate-50 dark:!bg-slate-900/40 !p-6 md:!p-8 h-full border-none shadow-none">
      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
        <div className="h-1 w-4 bg-violet-500 rounded-full" />
        Model Breakdown
      </h4>

      <div className="space-y-6">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">🖼</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tight text-slate-400">Layer Analysis</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Image Result</p>
            </div>
          </div>
          <p className="text-sm font-black text-violet-600 dark:text-violet-400">{result.image_result}</p>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">📊</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tight text-slate-400">Statistical Weight</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Image Confidence</p>
            </div>
          </div>
          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{(result.image_confidence * 100).toFixed(1)}%</p>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">🧾</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tight text-slate-400">Risk Profile</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Metadata Risk</p>
            </div>
          </div>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {result.metadata_probability
              ? (result.metadata_probability * 100).toFixed(1) + "%"
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
