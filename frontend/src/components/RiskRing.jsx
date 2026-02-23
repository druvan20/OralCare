export default function RiskRing({ value }) {
  const color =
    value >= 70 ? "#dc2626" : value >= 40 ? "#f59e0b" : "#16a34a";

  return (
    <div className="text-center">
      <svg width="180" height="180">
        <circle
          cx="90"
          cy="90"
          r="80"
          stroke="#e5e7eb"
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
          fontWeight="bold"
          fill={color}
        >
          {value}%
        </text>
      </svg>
      <p className="mt-2 font-medium">Overall Risk</p>
    </div>
  );
}
