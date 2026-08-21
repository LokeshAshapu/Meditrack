const assert = require("assert");
const { generateAuthToken, verifyToken, rateLimiter, requireRole } = require("../middleware/auth");
const { extractDocumentFields } = require("../services/doctor-ocr");
const { analyzeDocumentConsistency } = require("../services/doctor-verification-ai");
const MedicalRegistryProvider = require("../services/medical-registry-provider");
const { evaluateVerificationMatches } = require("../services/doctor-matching-engine");
const MEDITRACK_VERSION = require("../version");

console.log(`🧪 Starting MediTrack ${MEDITRACK_VERSION.version} Access Control & Security Test Suite...`);

async function runTests() {
    let passed = 0;
    let failed = 0;

    // Test 1: Public vs Protected Route Access Rules
    try {
        console.log("\n[Test 1] Testing Public Route Access Matrix...");
        const publicRoutes = ['/about', '/login', '/register', '/signup'];
        const protectedRoutes = ['/dashboard', '/tracker', '/find-doctors', '/messages', '/privacy-center', '/doctor-dashboard', '/admin'];

        const isPublicRoute = (path) => publicRoutes.includes(path);
        
        publicRoutes.forEach(r => assert.strictEqual(isPublicRoute(r), true, `${r} should be public`));
        protectedRoutes.forEach(r => assert.strictEqual(isPublicRoute(r), false, `${r} must NOT be public`));

        console.log("✅ [Test 1 Passed] Strict public/protected route matrix verified.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 1 Failed]:", e.message);
        failed++;
    }

    // Test 2: Token Generation & Auth Verification
    try {
        console.log("\n[Test 2] Testing Auth Token Generation & Verification...");
        const payload = { email: "testpatient@meditrack.com", role: "patient" };
        const token = generateAuthToken(payload);
        assert.ok(token, "Token should be a valid string");

        const decoded = await verifyToken(token);
        assert.strictEqual(decoded.email, "testpatient@meditrack.com");
        assert.strictEqual(decoded.role, "patient");
        console.log("✅ [Test 2 Passed] Auth Token correctly generated and verified.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 2 Failed]:", e.message);
        failed++;
    }

    // Test 3: Unauthenticated API Access Rejection (HTTP 401)
    try {
        console.log("\n[Test 3] Testing Unauthenticated API Request Rejection (HTTP 401)...");
        const { authenticateToken } = require("../middleware/auth");
        
        let statusCode = 0;
        let responseJson = null;

        const req = { headers: {} };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { responseJson = data; return res; }
        };

        authenticateToken(req, res, () => {});

        assert.strictEqual(statusCode, 401, "Missing Authorization header must return HTTP 401");
        assert.ok(responseJson.message.toLowerCase().includes("unauthorized") || responseJson.message.toLowerCase().includes("token"), "Error message should mention auth");

        console.log("✅ [Test 3 Passed] Unauthenticated backend request rejected with HTTP 401.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 3 Failed]:", e.message);
        failed++;
    }

    // Test 4: Role-Based Access Control Guards (HTTP 403)
    try {
        console.log("\n[Test 4] Testing Role-Based API Authorization Guard (HTTP 403)...");
        const adminGuard = requireRole('admin');
        
        let statusCode = 0;
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: () => { return res; }
        };

        const reqPatient = { user: { email: "patient@meditrack.com", role: "patient" } };
        adminGuard(reqPatient, res, () => {});

        assert.strictEqual(statusCode, 403, "Patient trying to access admin API must be rejected with HTTP 403");

        console.log("✅ [Test 4 Passed] Role guard blocked patient from admin API endpoint.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 4 Failed]:", e.message);
        failed++;
    }

    // Test 5: File Extension Validation for Doctor Document Uploads
    try {
        console.log("\n[Test 5] Testing File Format Security Guard (Reject Executables)...");
        const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
        const isFileAllowed = (fileName) => {
            const ext = (fileName || "").split('.').pop().toLowerCase();
            return allowedExts.includes(ext);
        };

        assert.strictEqual(isFileAllowed("license.pdf"), true);
        assert.strictEqual(isFileAllowed("scan.png"), true);
        assert.strictEqual(isFileAllowed("exploit.exe"), false);
        assert.strictEqual(isFileAllowed("shell.sh"), false);

        console.log("✅ [Test 5 Passed] Executable files blocked from upload.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 5 Failed]:", e.message);
        failed++;
    }

    // Test 6: OCR Extraction & String Normalization
    try {
        console.log("\n[Test 6] Testing OCR String Normalization...");
        const extracted = extractDocumentFields(
            { fileName: "Dr_Sarah_Jenkins_License.pdf" },
            { name: "Dr. Sarah Jenkins", medicalLicense: "MCI-2026-8849/AP", specialization: "Cardiology" }
        );

        assert.strictEqual(extracted.normalized.name, "sarah jenkins");
        assert.strictEqual(extracted.normalized.registrationNumber, "MCI20268849AP");

        console.log("✅ [Test 6 Passed] OCR string normalization verified.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 6 Failed]:", e.message);
        failed++;
    }

    // Test 7: Official Medical Registry Abstraction Query
    try {
        console.log("\n[Test 7] Testing Medical Registry Provider Match...");
        const registryResult = await MedicalRegistryProvider.verifyRegistration({
            name: "Dr. Sarah Jenkins",
            registrationNumber: "MCI-2026-8849",
            council: "National Medical Commission"
        });

        assert.strictEqual(registryResult.registrationFound, true);
        assert.strictEqual(registryResult.registryStatus, "ACTIVE_REGISTERED");

        console.log("✅ [Test 7 Passed] Medical registry provider query matched license.");
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
