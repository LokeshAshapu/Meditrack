# MediTrack Doctor Verification 2.0 — Architecture & Workflow Specification (Phase 15)

**Version:** 2.0  
**Scope:** AI-Assisted Credential Verification, Official Registry Abstraction, Deterministic Matching, and Admin Approval Workflow  

---

## 1. Executive Summary & Core Principle

MediTrack Doctor Verification 2.0 introduces a multi-stage credential verification pipeline designed to assist administrators in reviewing physician licenses while enforcing human accountability:

```
[ Doctor ] ──► Upload License ──► [ Secure Server Storage ]
                                             │
                                             ▼
                                  [ OCR & Field Extraction ]
                                             │
                                             ▼
                                  [ AI Consistency Analysis ] ──► (Advisory Evidence)
                                             │
                                             ▼
                                  [ Official Registry Query ] ──► (Authoritative Source)
                                             │
                                             ▼
                                  [ Deterministic Matcher ] ──► Recommendation
                                             │
                                             ▼
                                  [ Admin Verification Center ] ──► Final Decision (APPROVED/REJECTED)
```

**Core Operating Principle**:
- **AI** = Advisory evidence (readability, completeness, formatting warnings).
- **Official Registry** = Authoritative data source (National/State Medical Council).
- **Administrator** = Final decision authority.

---

## 2. Pipeline Stage Breakdown

### 2.1 Stage 1: Document Upload (`POST /api/doctor/upload-license`)
- Validates file format (`PDF`, `JPG`, `JPEG`, `PNG`) and file size (`<10MB`).
- Generates safe server-side filename (`lic_{uid}_{timestamp}.{ext}`).

### 2.2 Stage 2: OCR & String Normalization (`doctor-ocr.js`)
- Extracts Doctor Name, Registration Number, Medical Council, and Specialization.
- Normalizes names by stripping titles (`Dr.`, `Doctor`) and punctuation.
- Normalizes registration numbers by stripping formatting separators (`/`, `-`, spaces).

### 2.3 Stage 3: AI Consistency Analysis (`doctor-verification-ai.js`)
- Assesses field completeness, spelling variances, and formatting anomalies.
- Returns structured JSON score (`consistencyScore`, `warnings`).
- **Strict Rule**: Never claims 100% genuine or fake.

### 2.4 Stage 4: Official Registry Provider (`medical-registry-provider.js`)
- Queries official state/national medical council registry database.
- Handles graceful fallback (`available: false`, `registryStatus: "UNAVAILABLE_MANUAL_REVIEW"`, message: *"Automatic registry verification is currently unavailable."*).

### 2.5 Stage 5: Deterministic Matching Engine (`doctor-matching-engine.js`)
- Compares Submitted vs Extracted vs Registry data.
- Outputs recommendation: `AUTO_MATCHED`, `MANUAL_REVIEW`, or `VERIFICATION_FAILED`.

### 2.6 Stage 6: Admin Approval (`POST /api/admin/decide-doctor-verification`)
- Human administrator reviews AI advisory metrics, registry results, and original certificate in the **Doctor Verification Center** (`AdminDashboard.jsx`).
- Admin executes final `APPROVED` or `REJECTED` decision with review notes.

---

## 3. Official Registry Implementation Status

- **Status**: **PARTIALLY IMPLEMENTED (Provider Abstraction with Fallback)**
- **Authoritative Provider**: Integrated with National Medical Commission (NMC) & State Council query interface.
- **Fallback**: When an external registry API is offline or unconfigured, the system safely defaults to `MANUAL_REVIEW` and notifies the administrator: *"Automatic registry verification is currently unavailable."*
