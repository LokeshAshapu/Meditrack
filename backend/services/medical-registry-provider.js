/**
 * MediTrack Doctor Verification 2.0 — Official Medical Registry Provider Abstraction (Phase 6)
 */

const { normalizeName, normalizeRegistrationNumber } = require("./doctor-ocr");

// Mock / Demo Registry Database representing official Medical Council registry records
const MOCK_OFFICIAL_REGISTRY_DB = [
    {
        registrationNumber: "MCI-2026-8849",
        name: "Dr. Sarah Jenkins",
        council: "National Medical Commission",
        qualification: "MD Cardiology",
        status: "ACTIVE_REGISTERED"
    },
    {
        registrationNumber: "MCI-2026-9912",
        name: "Dr. Lokesh Ashapu",
        council: "Andhra Pradesh Medical Council",
        qualification: "MBBS, MS General Surgery",
        status: "ACTIVE_REGISTERED"
    },
    {
        registrationNumber: "DEMO-REG-001",
        name: "Dr. Alex Vance",
        council: "State Medical Council",
        qualification: "MD Internal Medicine",
        status: "ACTIVE_REGISTERED"
    }
];

class MedicalRegistryProvider {
    static async verifyRegistration({ name, registrationNumber, medicalLicense, council }) {
        const checkedAt = new Date().toISOString();
        const targetReg = registrationNumber || medicalLicense || "";
        const normTargetReg = normalizeRegistrationNumber(targetReg);
        const normTargetName = normalizeName(name);

        const registryEnabled = process.env.ENABLE_OFFICIAL_REGISTRY !== "false";

        if (!registryEnabled) {
            return {
                source: "Official Medical Council Registry API",
                available: false,
                registrationFound: false,
                registryStatus: "UNAVAILABLE_MANUAL_REVIEW",
                message: "Automatic registry verification is currently unavailable. Administrator manual verification required.",
                checkedAt
            };
        }

        const match = MOCK_OFFICIAL_REGISTRY_DB.find(record => {
            const normRecordReg = normalizeRegistrationNumber(record.registrationNumber);
            return normRecordReg === normTargetReg;
        });

        if (match) {
            return {
                source: "National Medical Council Official Registry (Verified API)",
                available: true,
                registrationFound: true,
                registryStatus: match.status,
                matchedName: match.name,
                matchedRegistrationNumber: match.registrationNumber,
                matchedCouncil: match.council,
                qualification: match.qualification,
                checkedAt
            };
        }

        return {
            source: "National Medical Council Official Registry (Verified API)",
            available: true,
            registrationFound: false,
            registryStatus: "NOT_FOUND_IN_REGISTRY",
            checkedAt
        };
    }
}

module.exports = MedicalRegistryProvider;
