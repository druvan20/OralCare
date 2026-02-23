export default function MetadataForm({ onChange }) {
  const fields = [
    "Tobacco Use",
    "Alcohol Consumption",
    "Betel Quid Use",
    "HPV Infection",
    "Poor Oral Hygiene",
    "Oral Lesions",
    "Unexplained Bleeding",
    "Difficulty Swallowing",
    "White or Red Patches in Mouth",
    "Family History of Cancer",
    "Age",
  ];

  const handleInput = (e) => {
    onChange(e.target.name, Number(e.target.value));
  };

  return (
    <div className="card">
      <h3>Patient Metadata</h3>

      {fields.map((field) => (
        <div key={field} style={{ marginBottom: 8 }}>
          <label>{field}</label>
          <input
            type="number"
            name={field}
            min="0"
            max="1"
            onChange={handleInput}
            required
          />
        </div>
      ))}
    </div>
  );
}
