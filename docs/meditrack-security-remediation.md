# MediTrack Security Remediation Report (Phase 1)

**Date:** August 21, 2026  
**Status:** Remediated & Verified  

---

## 1. Vulnerability Findings & Remediations

### VULN-01: Broken Access Control & IDOR across All Endpoints (OWASP A01)
- **Severity:** Critical (10/10)
- **Description:** Protected API routes accepted `email` via `req.body` or `req.query` without validating identity tokens.
- **Fix:** Implemented `authenticateToken` middleware in `backend/middleware/auth.js`. All protected endpoints now extract user identity (`req.user.email`, `req.user.role`, `req.user.uid`) directly from verified Bearer tokens. Query parameter email overrides are strictly ignored.

### VULN-02: Public Administrative Backdoor (`/make-me-admin`)
- **Severity:** Critical (10/10)
- **Description:** Route `POST /make-me-admin` allowed unauthenticated role elevation to `admin`.
- **Fix:** Completely removed the public backdoor endpoint. Admin creation is now restricted to initial seeding scripts or environment-protected administrative tools (`ADMIN_SETUP_SECRET`).

### VULN-03: Header/Query Mismatch in Admin Authorization (`verifyAdmin`)
- **Severity:** Critical (9/10)
- **Description:** `AdminDashboard.jsx` sent `admin-email` in HTTP headers, while `verifyAdmin` expected `req.body.email`. Doctor approvals failed with 400 Bad Request.
- **Fix:** Replaced custom header logic with central `requireRole('admin')` middleware that checks verified Bearer tokens.

### VULN-04: Insecure Wildcard CORS Policy
- **Severity:** Medium (6/10)
- **Description:** Backend initialized `app.use(cors())`, permitting unrestricted cross-origin requests.
- **Fix:** Configured CORS with an explicit origin allowlist derived from `process.env.ALLOWED_ORIGINS` (defaulting to trusted local/production frontend domains).

### VULN-05: Excessive Payload Size Limit & DoS Risk
- **Severity:** Medium (6/10)
- **Description:** `express.json({ limit: '50mb' })` allowed massive requests capable of exhausting server memory.
- **Fix:** Reduced JSON payload limit to `10mb` and added input length validation on file uploads.

### VULN-06: Un-Ratelimited AI Endpoint (`/chat`)
- **Severity:** Medium (6/10)
- **Description:** `/chat` route proxied to NVIDIA Llama 3.1 70B without rate limiting, exposing API quotas to depletion.
- **Fix:** Added rate-limiting middleware (`rateLimiter`) to `/chat`, `/login`, and `/signup` routes.

---

## 2. Updated Security Architecture

```
[ Frontend Client ]
        │
        │ 1. POST /login or /signup
        ▼
[ Auth Controller ] ──► Validates Credentials ──► Issues Signed Auth Token
        │
        │ 2. Headers: { Authorization: "Bearer <token>" }
        ▼
[ authenticateToken Middleware ]
        ├── Decodes & verifies Token Signature
        ├── Loads Firestore User Profile
        └── Sets req.user = { email, role, uid }
        │
        ▼
[ requireRole('admin' | 'doctor' | 'patient') ]
        ├── Checks req.user.role
        └── Blocks Unauthorized Access (403 Forbidden)
```
