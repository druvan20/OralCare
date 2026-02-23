export default function RecommendationBox({ decision }) {
  const isHigh =
    decision.toLowerCase().includes("malignant") ||
    decision.toLowerCase().includes("high") ||
    decision.toLowerCase().includes("refer");

  return (
    <div
      className={`p-6 rounded-lg border ${
        isHigh
          ? "bg-red-100 border-red-300 text-red-800"
          : "bg-green-100 border-green-300 text-green-800"
      }`}
    >
      <h4 className="font-semibold mb-2">Clinical Recommendation</h4>

      {isHigh ? (
        <p>
          ⚠️ High risk detected. Immediate consultation with an oral
          oncologist is strongly recommended.
        </p>
      ) : (
        <p>
          ✅ Low risk detected. Maintain oral hygiene and schedule
          routine check-ups.
        </p>
      )}
    </div>
  );
}
