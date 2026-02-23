export default function Stepper({ step }) {
  const steps = ["Upload", "Metadata", "Results"];

  return (
    <div className="flex justify-center gap-6 sm:gap-10 text-sm">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`pb-2 border-b-2 transition ${
            step === i + 1
              ? "border-emerald-600 text-emerald-600 font-medium"
              : "border-slate-200 text-slate-400"
          }`}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
