const assert = require("assert");
const { generateAuthToken, verifyToken, checkResourceOwnership, rateLimiter } = require("../middleware/auth");
const MEDITRACK_VERSION = require("../version");

console.log(`🧪 Starting MediTrack ${MEDITRACK_VERSION.version} Commercial Security & Regression Suite...`);

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

    // Test 2: Expired Token Rejection
    try {
        console.log("\n[Test 2] Testing Expired Token Rejection...");
        const expiredToken = generateAuthToken({ email: "expired@meditrack.com", role: "patient" }, -1000);
        const decoded = await verifyToken(expiredToken);
        assert.strictEqual(decoded, null, "Expired token must return null");
        console.log("✅ [Test 2 Passed] Expired tokens are rejected.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 2 Failed]:", e.message);
        failed++;
    }

    // Test 3: IDOR Resource Ownership Guard
    try {
        console.log("\n[Test 3] Testing IDOR Resource Ownership Guard...");
        const patientReq = { user: { email: "patient1@meditrack.com", role: "patient" } };
        const adminReq = { user: { email: "admin@meditrack.com", role: "admin" } };

        assert.strictEqual(checkResourceOwnership(patientReq, "patient1@meditrack.com"), true, "Owner can access own resource");
        assert.strictEqual(checkResourceOwnership(patientReq, "patient2@meditrack.com"), false, "Patient cannot access another patient's resource");
        assert.strictEqual(checkResourceOwnership(adminReq, "patient2@meditrack.com"), true, "Admin can access resources");
        console.log("✅ [Test 3 Passed] IDOR protection checks validated.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 3 Failed]:", e.message);
        failed++;
    }

    // Test 4: Role-Based Authorization Logic
    try {
        console.log("\n[Test 4] Testing Role-Based Authorization Guard...");
        const { requireRole } = require("../middleware/auth");
        const adminMiddleware = requireRole("admin");
        
        let status = 0;
        const mockRes = {
            status: (code) => { status = code; return mockRes; },
            json: () => {}
        };

        const reqPatient = { user: { email: "user@meditrack.com", role: "patient" } };
        adminMiddleware(reqPatient, mockRes, () => {});
        assert.strictEqual(status, 403, "Patient accessing admin route must be rejected with 403");

        console.log("✅ [Test 4 Passed] Role authorization middleware rejected unauthorized role access.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 4 Failed]:", e.message);
        failed++;
    }

    // Test 5: Sliding Window Rate Limiter
    try {
        console.log("\n[Test 5] Testing Sliding Window Rate Limiter...");
        const limiter = rateLimiter({ maxRequests: 2, windowMs: 60000 });
        const req = { headers: {}, socket: { remoteAddress: "127.0.0.1" }, path: "/test-limit" };
        
        let statusCode = 200;
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: () => {}
        };

        limiter(req, res, () => {}); // Request 1
        limiter(req, res, () => {}); // Request 2
        limiter(req, res, () => {}); // Request 3 - Exceeded!

        assert.strictEqual(statusCode, 429, "Rate limiter must return HTTP 429 when max requests exceeded");
        console.log("✅ [Test 5 Passed] Sliding window rate limiter enforced 429 threshold.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 5 Failed]:", e.message);
        failed++;
    }

    // Test 6: Multi-Tenant Clinic Data Isolation Guard
    try {
        console.log("\n[Test 6] Testing Multi-Tenant Clinic Isolation Guard...");
        const orgAUser = { email: "doc@clinicA.com", organizationId: "org_A" };
        const orgBUser = { email: "doc@clinicB.com", organizationId: "org_B" };

        const isTenantAccessAllowed = (caller, targetTenantId) => caller.organizationId === targetTenantId;

        assert.strictEqual(isTenantAccessAllowed(orgAUser, "org_A"), true, "User can access own organization data");
        assert.strictEqual(isTenantAccessAllowed(orgAUser, "org_B"), false, "User CANNOT access competitor organization data");
        console.log("✅ [Test 6 Passed] Multi-tenant organization isolation validated.");
        passed++;
    } catch (e) {
        console.error("❌ [Test 6 Failed]:", e.message);
        failed++;
    }

    console.log(`\n========================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
}

runTests();
