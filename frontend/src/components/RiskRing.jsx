export default function RiskRing({ value }) {
  const color =
    value >= 70 ? "#dc2626" : value >= 40 ? "#f59e0b" : "#16a34a";

  return (
    <div className="glass-card !bg-slate-50 dark:!bg-slate-900/40 !p-8 h-full border-none shadow-none text-center">
      <svg width="180" height="180" className="mx-auto">
        <circle
          cx="90"
          cy="90"
          r="80"
          stroke="currentColor"
          className="text-slate-100 dark:text-white/10"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="90"
          cy="90"
          r="80"
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${value * 5} 999`}
          transform="rotate(-90 90 90)"
        />
        <text
          x="90"
          y="100"
          textAnchor="middle"
          fontSize="28"
          fontFamily="monospace"
          fontWeight="900"
          fill={color}
        >
          {value}%
        </text>
      </svg>
      <p className="mt-4 font-black uppercase text-[10px] tracking-widest text-slate-500 italic">Overall Risk Confidence</p>
    </div>
  );
}
