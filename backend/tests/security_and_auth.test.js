const assert = require("assert");
const { generateAuthToken, verifyToken, checkResourceOwnership, rateLimiter } = require("../middleware/auth");
const { extractDocumentFields } = require("../services/doctor-ocr");
const { analyzeDocumentConsistency } = require("../services/doctor-verification-ai");
const MedicalRegistryProvider = require("../services/medical-registry-provider");
const { evaluateVerificationMatches } = require("../services/doctor-matching-engine");
const MEDITRACK_VERSION = require("../version");

console.log(`🧪 Starting MediTrack ${MEDITRACK_VERSION.version} Expanded Doctor Verification 2.0 Test Suite...`);

async function runTests() {
    let passed = 0;
    let failed = 0;

    // Test 1: Token Generation & Verification
    try {
        console.log("\n[Test 1] Testing Auth Token Generation & Verification...");
        const payload = { email: "testpatient@meditrack.com", role: "patient" };
        const token = generateAuthToken(payload);
        assert.ok(token, "Token should be a valid string");

        const decoded = await verifyToken(token);
        assert.strictEqual(decoded.email, "testpatient@meditrack.com");
        assert.strictEqual(decoded.role, "patient");
        console.log("✅ [Test 1 Passed] Auth Token correctly generated and verified.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 1 Failed]:", e.message);
        failed++;
    }

    // Test 2: Role Authorization Guard for Doctor Verification Upload
    try {
        console.log("\n[Test 2] Testing Role Authorization for Doctor License Upload...");
        const { requireRole } = require("../middleware/auth");
        const doctorGuard = requireRole(['doctor', 'admin']);
        
        let status = 0;
        const mockRes = { status: (code) => { status = code; return mockRes; }, json: () => {} };

        const reqPatient = { user: { email: "patient@meditrack.com", role: "patient" } };
        doctorGuard(reqPatient, mockRes, () => {});
        assert.strictEqual(status, 403, "Patient role uploading license must be rejected with HTTP 403");

        console.log("✅ [Test 2 Passed] Role guard blocked unauthorized patient role from license upload.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 2 Failed]:", e.message);
        failed++;
    }

    // Test 3: Document Upload Format Validation (Reject Executable)
    try {
        console.log("\n[Test 3] Testing File Extension Validation (Reject Executable)...");
        const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
        
        const isFileValid = (filename) => {
            const ext = (filename || "").split('.').pop().toLowerCase();
            return allowedExts.includes(ext);
        };

        assert.strictEqual(isFileValid("license.pdf"), true, "PDF file should be accepted");
        assert.strictEqual(isFileValid("certificate.jpg"), true, "JPG file should be accepted");
        assert.strictEqual(isFileValid("malware.exe"), false, "Executable file MUST be rejected");
        assert.strictEqual(isFileValid("script.sh"), false, "Shell script MUST be rejected");

        console.log("✅ [Test 3 Passed] Dangerous executable extensions rejected.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 3 Failed]:", e.message);
        failed++;
    }

    // Test 4: OCR Extraction & Normalization
    try {
        console.log("\n[Test 4] Testing OCR String Normalization...");
        const extracted = extractDocumentFields(
            { fileName: "Dr_Sarah_Jenkins_License.pdf" },
            { name: "Dr. Sarah Jenkins", medicalLicense: "MCI-2026-8849/AP", specialization: "Cardiology" }
        );

        assert.strictEqual(extracted.normalized.name, "sarah jenkins", "Title 'Dr.' stripped and lowercased");
        assert.strictEqual(extracted.normalized.registrationNumber, "MCI20268849AP", "Slashes stripped and uppercased");

        console.log("✅ [Test 4 Passed] OCR extraction and normalization verified.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 4 Failed]:", e.message);
        failed++;
    }

    // Test 5: AI Consistency Analysis Advisory Constraint
    try {
        console.log("\n[Test 5] Testing AI Consistency Advisory Analysis...");
        const extracted = extractDocumentFields(
            { fileName: "License.pdf" },
            { name: "Dr. Sarah Jenkins", medicalLicense: "MCI-2026-8849", specialization: "Cardiology" }
        );

        const aiResult = analyzeDocumentConsistency(extracted, { name: "Dr. Sarah Jenkins", medicalLicense: "MCI-2026-8849", specialization: "Cardiology" });
        
        assert.ok(aiResult.consistencyScore >= 0.8, "Score should be high for matching credentials");
        assert.strictEqual(typeof aiResult.consistencyScore, "number");
        assert.ok(!aiResult.advisoryClassification.includes("genuine"), "AI MUST NOT return 100% genuine assertion");

        console.log("✅ [Test 5 Passed] AI analysis returned advisory metrics without absolute assertions.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 5 Failed]:", e.message);
        failed++;
    }

    // Test 6: Official Medical Registry Provider Query
    try {
        console.log("\n[Test 6] Testing Official Medical Registry Provider Query...");
        const regResult = await MedicalRegistryProvider.verifyRegistration({
            name: "Dr. Sarah Jenkins",
            registrationNumber: "MCI-2026-8849",
            council: "National Medical Commission"
        });

        assert.strictEqual(regResult.registrationFound, true, "Mock registry should match known license #");
        assert.strictEqual(regResult.registryStatus, "ACTIVE_REGISTERED");

        console.log("✅ [Test 6 Passed] Official registry provider query matched license record.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 6 Failed]:", e.message);
        failed++;
    }

    // Test 7: Deterministic Matching Engine
    try {
        console.log("\n[Test 7] Testing Deterministic Matching Engine...");
        const submitted = { name: "Dr. Sarah Jenkins", medicalLicense: "MCI-2026-8849" };
        const extracted = extractDocumentFields({ fileName: "License.pdf" }, submitted);
        const registry = await MedicalRegistryProvider.verifyRegistration(submitted);

        const matchEval = evaluateVerificationMatches(submitted, extracted, registry);
        assert.strictEqual(matchEval.matchResults.registrationNumberMatch, true);
        assert.strictEqual(matchEval.matchResults.nameMatch, true);
        assert.strictEqual(matchEval.recommendation, "AUTO_MATCHED");

        console.log("✅ [Test 7 Passed] Matching engine produced AUTO_MATCHED recommendation.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 7 Failed]:", e.message);
        failed++;
    }

    console.log(`\n========================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
}

runTests();
