# MediTrack API Security & Authorization Architecture

**Document Version:** 1.0  
**Scope:** Backend REST endpoints, middleware guards, rate limiting, and token security.

---

## 1. Authentication & Token Management

MediTrack uses centralized token authentication enforced by `backend/middleware/auth.js`:

- **Token Format:** Signed Bearer tokens (`Authorization: Bearer <token>`).
- **Token Verification:** Every protected endpoint invokes `authenticateToken` middleware, decoding token signatures using `firebase-admin/auth` or HMAC-SHA256 verification.
- **Identity Isolation:** Email addresses in request parameters (`req.body.email`, `req.query.email`) are strictly ignored for authorization. User context (`req.user.email`, `req.user.role`, `req.user.uid`) is established exclusively from the validated Bearer token.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Endpoint | Permitted Roles | Authorization Guard | Description |
| :--- | :--- | :--- | :--- |
| `POST /signup`, `POST /login` | Public | Rate Limiter | Account registration and authentication |
| `PUT /update-profile`, `GET /get-user-profile` | Patient, Doctor, Admin | `authenticateToken` | Profile management |
| `POST /add-tracker`, `GET /get-tracker`, `PUT /update-tracker/:id` | Patient, Admin | `authenticateToken` | Medication scheduling |
| `POST /log-medication`, `GET /get-adherence`, `GET /get-streak` | Patient | `authenticateToken` | Adherence logging & calculations |
| `GET /get-unverified-doctors`, `POST /verify-doctor`, `POST /reject-doctor` | Admin | `requireRole('admin')` | Admin verification queue |
| `POST /book-appointment`, `GET /get-patient-appointments` | Patient, Admin | `authenticateToken` | Telemedicine booking |
| `GET /get-doctor-appointments` | Doctor, Admin | `requireRole(['doctor', 'admin'])` | Physician schedule |
| `POST /chat` | Patient, Doctor, Admin | `rateLimiter(20 req/15m)` | Educational AI Assistant |
| `GET /api/business-metrics` | Admin | `requireRole('admin')` | Real-time platform analytics |

---

## 3. Rate Limiting & DoS Protection

- **JSON Payload Limit:** Capped at `10mb`.
- **API Rate Limiter:** Applied on `/chat`, `/signup`, `/login` to prevent credential stuffing and AI API quota depletion.
- **Explicit CORS Allowlist:** Restricts cross-origin requests to configured trusted origins (`ALLOWED_ORIGINS`).
