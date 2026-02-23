import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Heuristic mapping from AI fusion score to clinical screening stage
 * @param {number} score - 0.0 to 1.0
 * @param {string} decision - "Malignant" or "Benign"
 */
export const getHeuristicStage = (score = 0, decision = "Unknown") => {
    if (decision === "Benign") return { stage: "N/A", color: "#10b981", desc: "No immediate pathological stage detected." };

    // Malignant staging heuristic based on confidence intervals
    if (score >= 0.85) return { stage: "Stage IV", color: "#dc2626", desc: "Advanced indicators detected. Urgent oncological evaluation required." };
    if (score >= 0.70) return { stage: "Stage III", color: "#ea580c", desc: "Progressive indicators detected. Immediate clinical assessment advised." };
    if (score >= 0.60) return { stage: "Stage II", color: "#f59e0b", desc: "Moderate indicators detected. Specialized biopsy recommended." };
    return { stage: "Stage I", color: "#6366f1", desc: "Localized indicators detected. Early-stage monitoring and referral required." };
};

export const generateMedicalReport = (data) => {
    const { user, result, clinics = [] } = data;
    if (!result) throw new Error("No screening data provided");

    const doc = new jsPDF();
    const stageInfo = getHeuristicStage(result.final_score || 0, result.final_decision || "Unknown");

    // --- Header ---
    doc.setFillColor(139, 92, 246); // Violet 600
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("OralCare AI", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Powered by SOL.AI Clinical Engine", 20, 28);

    doc.setFontSize(14);
    doc.text("Medical Screening Report", 140, 25);

    // --- Patient Info ---
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    const displayPatientName = result?.patientName || user?.name || "Anonymous";
    doc.text(`Patient Identity: ${displayPatientName}`, 20, 55);
    doc.text(`Record Assigned to: ${user?.name || "N/A"} (${user?.email || "N/A"})`, 20, 60);
    doc.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 140, 55);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 60);

    // --- Analysis Output ---
    doc.line(20, 65, 190, 65);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Clinical Assessment", 20, 75);

    const tableData = [
        ["Diagnostic Decision", result.final_decision || "N/A"],
        ["Aggregated Risk Factor", `${Math.round((result.final_score || 0) * 100)}%`],
        ["Screening Stage", stageInfo.stage],
        ["Image Model Confidence", `${Math.round((result.image_confidence || 0) * 100)}%`],
        ["Metadata Risk Probability", result.metadata_probability ? `${Math.round(result.metadata_probability * 100)}%` : "N/A"]
    ];

    autoTable(doc, {
        startY: 82,
        head: [["Metric", "Value"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 20, right: 20 }
    });

    // --- Recommendations ---
    const finalY = (doc).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Clinical Recommendations", 20, finalY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const recommendations = [
        `Stage Context: ${stageInfo.desc}`,
        "1. Immediate consultation with an oral oncologist is advised.",
        "2. Present this report to your medical provider for history evaluation.",
        "3. Do not ignore persistent lesions or changes in oral tissue.",
        "4. Tobacco and alcohol cessation is strongly recommended if applicable."
    ];
    doc.text(recommendations, 20, finalY + 8);

    // --- Found Clinics ---
    if (clinics.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Nearby Facilities", 20, finalY + 50);

        clinics.slice(0, 6).forEach((clinic, i) => {
            const rowY = finalY + 58 + (i * 15);
            if (rowY > 275) return; // Simple page overflow
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${i + 1}. ${clinic.name}`, 20, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(`${clinic.address} (${clinic.distance} km away)`, 20, rowY + 5);
        });
    }

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Disclaimer: This is an AI-generated screening output. It is NOT a definitive diagnosis. Consult a qualified clinical professional immediately.", 20, 285);

    doc.save(`OralCare_Report_${(user?.name || "Patient").replace(/\s+/g, '_')}.pdf`);
};
