/**
 * MediTrack Doctor Verification 2.0 — AI-Assisted Document Analysis Service (Phase 5)
 * 
 * CORE PRINCIPLE:
 * AI output is ADVISORY EVIDENCE ONLY.
 * The AI MUST NEVER declare a doctor 100% genuine or 100% fake.
 */

const { normalizeName, normalizeRegistrationNumber } = require("./doctor-ocr");

function analyzeDocumentConsistency(extractedData, submittedData) {
    const warnings = [];

    const normSubmittedName = normalizeName(submittedData.name);
    const normExtractedName = extractedData.normalized.name;

    const normSubmittedReg = normalizeRegistrationNumber(submittedData.medicalLicense || submittedData.registrationNumber);
    const normExtractedReg = extractedData.normalized.registrationNumber;

    let matchCount = 0;
    let totalChecks = 2;

    if (normSubmittedName && normExtractedName && (normSubmittedName.includes(normExtractedName) || normExtractedName.includes(normSubmittedName))) {
        matchCount++;
    } else {
        warnings.push("Name spelling variance between registration form and document.");
    }

    if (normSubmittedReg && normExtractedReg && normSubmittedReg === normExtractedReg) {
        matchCount++;
    } else {
        warnings.push("Registration license number formatting mismatch.");
    }

    const fieldCompleteness = (submittedData.name && (submittedData.medicalLicense || submittedData.registrationNumber) && submittedData.specialization) ? 1.0 : 0.7;
    const consistencyScore = Number((matchCount / totalChecks).toFixed(2));
    const readable = true;
    const requiresManualReview = warnings.length > 0 || consistencyScore < 0.8;

    return {
        readable,
        fieldCompleteness,
        consistencyScore,
        suspiciousIndicators: [],
        warnings,
        advisoryClassification: requiresManualReview ? "requires_manual_review" : "consistent",
        notice: "AI analysis is advisory evidence only. Final verification decision rests with the authorized administrator."
    };
}

module.exports = {
    analyzeDocumentConsistency
};
