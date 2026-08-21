# MediTrack Testing Infrastructure & Test Suite Documentation (Phase 15)

**Document Version:** 1.0  
**Test Suite Coverage:** Security, Auth, IDOR, Role Authorization, Encryption, API Security  

---

## 1. Automated Test Suites Executed

### 1.1 Security & Token Authentication Test Suite
- **File:** `backend/tests/security_and_auth.test.js`
- **Execution Command:** `node backend/tests/security_and_auth.test.js`
- **Test Scenarios Verified:**
  1. **Token Generation & Verification:** Validates that HMAC-SHA256 tokens are generated with user identity claims and correctly verified by backend middleware.
  2. **Expired Token Rejection:** Confirms that expired tokens return `null` and block access.
  3. **IDOR Ownership Verification:** Validates that patients can only access their own resources while Admins retain management access.
  4. **Role-Based Authorization:** Verifies that patients attempting to access Admin endpoints receive HTTP 403 Forbidden errors.

---

## 2. Running Test Suites

```bash
# Run Security and Auth Test Suite
node backend/tests/security_and_auth.test.js

# Run Frontend Linter & Build Verification
cd frontend
npm run build
```
