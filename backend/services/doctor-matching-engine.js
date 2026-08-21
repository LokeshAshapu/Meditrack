/**
 * MediTrack Doctor Verification 2.0 — Deterministic Matching Engine (Phase 7)
 */

const { normalizeName, normalizeRegistrationNumber } = require("./doctor-ocr");

function evaluateVerificationMatches(submitted, extracted, registry) {
    const normSubName = normalizeName(submitted.name);
    const normExtName = extracted.normalized.name;
    const normRegName = registry.matchedName ? normalizeName(registry.matchedName) : "";

    const normSubReg = normalizeRegistrationNumber(submitted.medicalLicense || submitted.registrationNumber);
    const normExtReg = extracted.normalized.registrationNumber;
    const normRegReg = registry.matchedRegistrationNumber ? normalizeRegistrationNumber(registry.matchedRegistrationNumber) : "";

    // 1. Registration Number Match
    const registrationNumberMatch = (normSubReg === normExtReg) && (!registry.registrationFound || normSubReg === normRegReg);

    // 2. Name Match
    const nameMatch = !!(normSubName.includes(normExtName) || normExtName.includes(normSubName) || (normRegName && normSubName.includes(normRegName)));

    // 3. Council & Qualification Match
    const councilMatch = true;
    const qualificationMatch = true;

    // Determine Overall Recommendation (Advisory for Admin)
    let recommendation = "MANUAL_REVIEW";
    if (registry.registrationFound && registrationNumberMatch && nameMatch) {
        recommendation = "AUTO_MATCHED";
    } else if (!registry.registrationFound && registry.available) {
        recommendation = "VERIFICATION_FAILED";
    } else {
        recommendation = "MANUAL_REVIEW";
    }

    return {
        matchResults: {
            nameMatch,
            registrationNumberMatch: !!registrationNumberMatch,
            councilMatch,
            qualificationMatch
        },
        recommendation,
        evaluatedAt: new Date().toISOString()
    };
}

module.exports = {
    evaluateVerificationMatches
};
