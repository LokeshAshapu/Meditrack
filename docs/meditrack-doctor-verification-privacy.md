# MediTrack Doctor Verification 2.0 — Privacy & Data Protection Architecture (Phase 12)

**Document Version:** 1.0  
**Scope:** Doctor Credential Processing, Document Data Protection, AI Advisory Boundaries, and Registry Interoperability  

---

## 1. Information Collection & Purpose

| Information Type | Collection Point | Purpose | Storage & Retention |
| :--- | :--- | :--- | :--- |
| **Medical License Document** | Doctor License Upload | Extracted for OCR & Admin Credential Verification | Stored securely; restricted to Doctor owner and Admin role |
| **Extracted OCR Metadata** | OCR Service (`doctor-ocr.js`) | Normalization of name, registration #, and council | Stored in `users` collection (`doctorVerification.extractedData`) |
| **AI Consistency Score** | AI Service (`doctor-verification-ai.js`) | Advisory evidence for admin review | Advisory score & warnings stored in `users.doctorVerification` |
| **Registry Verification Record**| Official Registry Abstraction | Validation against official medical council registry | Audit log & match status recorded in `users.doctorVerification` |

---

## 2. Access Isolation & Security Controls

1. **Role-Based Access**:
   - `doctor`: Can access only their own verification status and resubmit documentation.
   - `admin`: Can review document OCR extractions, AI consistency scores, registry query results, and issue final approval/rejection decisions.
   - `patient`: Zero access to doctor verification documents or internal verification metadata.

2. **AI Processing Boundaries**:
   - AI outputs are strictly **advisory evidence**.
   - AI does NOT store, train on, or retain uploaded document contents.
   - AI does NOT possess authority to grant or deny clinical status.

3. **Data Minimization**:
   - Log files do NOT record raw OCR text containing unnecessary PII.
   - System error logs never output private license keys or document contents.
