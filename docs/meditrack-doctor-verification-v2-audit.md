# MediTrack Doctor Verification v2 — Initial System Audit (Phase 1)

**Audit Date:** August 21, 2026  
**Auditor:** Healthcare SaaS & Security Engineering Team  

---

## 1. Existing Doctor Verification Workflow Analysis

### 1.1 Registration Flow
- **Frontend**: [`SignupPage.jsx`](file:///c:/Users/ASUS/Lokesh/meditrack/frontend/src/components/SignupPage.jsx) allows users to register with role `doctor`, providing `specialization`, `experience`, `hospital`, and an optional text string for `medicalLicense`.
- **Backend**: `POST /signup` sets `isVerified: false` by default for all doctor registrations.

### 1.2 Administration Approval Flow
- **Endpoints**: `GET /get-unverified-doctors`, `POST /verify-doctor`, `POST /reject-doctor`.
- **Current Limitation**: Verification was binary (`isVerified: true/false`) without document validation, registration number extraction, consistency checks, or official medical council registry verification.

---

## 2. Target Architecture Upgrade (Verification 2.0)

| Layer | Component | Function & Responsibility |
| :--- | :--- | :--- |
| **Ingestion** | `POST /api/doctor/upload-license` | Validates PDF/image file type and size (<10MB); saves securely on server. |
| **Extraction** | `backend/services/doctor-ocr.js` | Extracts fields: Doctor Name, Registration #, Council, Qualification, Dates. |
| **AI Analysis** | `backend/services/doctor-verification-ai.js` | Uses NVIDIA LLM/AI to assess document readability, completeness, and formatting consistency. Returns advisory metrics (score, warnings). **Never directly approves or rejects**. |
| **Registry Query**| `backend/services/medical-registry-provider.js` | Abstracted API layer checking official state/national medical council registries. Fallback to `MANUAL_REVIEW` when external registry APIs are unavailable. |
| **Matching Engine**| `backend/services/doctor-matching-engine.js` | Deterministic comparison of Submitted vs Extracted vs Registry data. Outputs recommendation (`AUTO_MATCHED`, `MANUAL_REVIEW`, `VERIFICATION_FAILED`). |
| **Admin Decision**| `AdminDashboard.jsx` (Verification Center) | Human administrator reviews AI advisory metrics, registry results, and original document before granting approval. |
