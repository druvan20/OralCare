import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Heuristic mapping from AI fusion score to clinical screening stage
 * @param {number} score - 0.0 to 1.0
 * @param {string} decision - "Malignant" or "Benign"
 */
export const getHeuristicStage = (score = 0, decision = "Unknown") => {
    if (decision === "Benign") return { stage: "N/A", color: [16, 185, 129], hex: "#10b981", desc: "No immediate pathological stage detected." };

    if (score >= 0.85) return { stage: "Stage IV", color: [220, 38, 38], hex: "#dc2626", desc: "Advanced indicators detected. Urgent oncological evaluation required." };
    if (score >= 0.70) return { stage: "Stage III", color: [234, 88, 12], hex: "#ea580c", desc: "Progressive indicators detected. Immediate clinical assessment advised." };
    if (score >= 0.60) return { stage: "Stage II", color: [245, 158, 11], hex: "#f59e0b", desc: "Moderate indicators detected. Specialized biopsy recommended." };
    return { stage: "Stage I", color: [99, 102, 241], hex: "#6366f1", desc: "Localized indicators detected. Early-stage monitoring and referral required." };
};

export const generateMedicalReport = (data) => {
    const { user, result, clinics = [] } = data;
    if (!result) throw new Error("No screening data provided");

    const doc = new jsPDF();
    const stageInfo = getHeuristicStage(result.final_score || 0, result.final_decision || "Unknown");

    // --- Modern Sleek Header ---
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SOL.AI", 20, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CLINICAL DIAGNOSTIC ENGINE", 20, 26);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 92, 246); // Violet 500
    doc.text("MEDICAL ASSESSMENT REPORT", 120, 20);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`ID: SOL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`, 120, 26);

    // --- Content Background & Separators ---
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(20, 40, 190, 40);

    // --- Patient Information Grid ---
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT IDENTITY", 20, 50);
    doc.setFont("helvetica", "normal");
    const displayPatientName = result?.patientName || user?.name || "Anonymous / Unregistered";
    doc.text(displayPatientName, 20, 56);

    doc.setFont("helvetica", "bold");
    doc.text("RECORD ASSIGNED CLINICIAN", 90, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`${user?.name || "System"} (${user?.email || "N/A"})`, 90, 56);

    doc.setFont("helvetica", "bold");
    doc.text("ACQUISITION DATE", 160, 50);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 160, 56);

    // --- Primary Risk Assessment Banner ---
    const isMalignant = result.final_decision === "Malignant";
    const bannerColor = stageInfo.color;
    
    doc.setFillColor(...bannerColor);
    doc.rect(20, 65, 170, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FINAL DECISION:", 25, 76);
    doc.setFontSize(20);
    doc.text(result.final_decision.toUpperCase(), 75, 77);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Risk Factor: ${Math.round((result.final_score || 0) * 100)}% | Stage: ${stageInfo.stage}`, 25, 87);

    // --- Telemetry Metrics ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("System Telemetry Metrics", 20, 110);

    const tableData = [
        ["Visual Inference Confidence", `${Math.round((result.image_confidence || 0) * 100)}%`],
        ["Clinical Metadata Risk Factor", result.metadata_probability ? `${Math.round(result.metadata_probability * 100)}%` : "N/A"],
        ["Aggregated Confidence Vector", `${Math.round((result.final_score || 0) * 100)}%`]
    ];

    autoTable(doc, {
        startY: 115,
        head: [["Metric", "Value"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold" },
        styles: { textColor: [51, 65, 85], font: "helvetica" },
        margin: { left: 20, right: 20 }
    });

    let currentY = (doc).lastAutoTable.finalY + 15;

    // --- Recommendations ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Clinical Recommendations", 20, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    currentY += 8;
    doc.text(`Diagnostic Context: ${stageInfo.desc}`, 20, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const recs = [
        "1. Immediate consultation with an oral oncologist is advised.",
        "2. Present this report to your medical provider for history evaluation.",
        "3. Do not ignore persistent lesions or changes in oral tissue.",
        "4. Tobacco and alcohol cessation is strongly recommended if applicable."
    ];
    
    currentY += 6;
    doc.text(recs, 20, currentY);
    currentY += 25;

    // --- Dedicated Primary Care / First Advice Hospital Section for Malignant cases ---
    if (isMalignant && clinics.length > 0) {
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.rect(20, currentY, 170, 75, "FD"); // Background box

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PRIMARY CARE & FIRST ADVICE CLINICS", 25, currentY + 10);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Nearest specialist oncology nodes verified via GPS routing protocol.", 25, currentY + 16);

        let listY = currentY + 28;
        
        clinics.slice(0, 3).forEach((clinic, i) => {
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${i + 1}. ${clinic.name.toUpperCase()}`, 25, listY);
            
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`${clinic.address}  |  Distance: ${clinic.distance} km`, 30, listY + 5);
            
            listY += 14;
        });
        
        currentY = currentY + 80;
    } else if (clinics.length > 0) {
        // Just standard nearby facilities
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Nearby Observation Facilities", 20, currentY);
        
        let listY = currentY + 8;
        clinics.slice(0, 3).forEach((clinic, i) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${i + 1}. ${clinic.name}`, 20, listY);
            doc.setFont("helvetica", "normal");
            doc.text(`${clinic.address} (${clinic.distance} km away)`, 20, listY + 5);
            listY += 12;
        });
        currentY = listY;
    }

    // --- Footer ---
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("DISCLAIMER: This document is an AI-generated screening output. It is NOT a definitive clinical diagnosis.", 20, 285);
    doc.text("Consult a board-certified physician or oral pathologist immediately for definitive care.", 20, 289);

    doc.save(`SOL_AI_Report_${(displayPatientName).replace(/\s+/g, '_')}.pdf`);
};
