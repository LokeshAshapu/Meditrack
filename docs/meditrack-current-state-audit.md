# MediTrack Current State Audit & Architecture Discovery (Phase 0)

**Date of Audit:** August 21, 2026  
**Auditor:** Senior Software Architect & Security Engineer  
**System Scope:** MediTrack Monorepo (`frontend/` React 19 + Vite, `backend/` Node.js + Express 5 + Firebase Admin)

---

## 1. Current System Architecture

MediTrack is structured as a decoupled full-stack JavaScript application:

```
[ Frontend: React 19 + Vite + Tailwind CSS ]
         │
         ├──────► [ Local-First Browser Storage: IndexedDB (localforage) ]
         │         (Medical Vault: Scans, Prescriptions, Lab Reports)
         │
         ├──────► [ Direct Client Firebase SDK / WebRTC ]
         │         (FCM Notifications, Jitsi Video Consultations)
         │
         └──────► [ Backend: Node.js 22 + Express 5 API ]
                   ├── Firebase Admin SDK (Firestore DB & Auth)
                   ├── Twilio SDK (Voice Calls & SMS Alerts)
                   ├── Nodemailer (HTML Email Cards)
                   ├── OpenAI Node SDK (NVIDIA Llama 3.1 70B AI Assistant)
                   └── node-cron (Scheduled Reminder Engine)
```

---

## 2. Inventory of Current Features & Components

### 2.1 Frontend Modules (`frontend/src/`)
- **`App.jsx` & Router:** Routes for `/`, `/login`, `/signup`, `/dashboard`, `/tracker`, `/find-doctors`, `/doctor-profile`, `/doctor-dashboard`, `/admin`, `/chat`, `/help`, `/contact`, `/terms`, `/privacy`.
- **`LoginPage.jsx` & `SignupPage.jsx`:** Authenticates users via HTTP POST to `/login` and `/signup`. Stores `userEmail`, `userRole`, `userName`, `userPhone` in browser `localStorage`.
- **`Dashboard.jsx`:** Main patient panel featuring daily medicine checklists, adherence streak counter, local document upload to `localforage` (IndexedDB), appointment bookings, and quick doctor contact.
- **`Tracker.jsx`:** Form to add/edit medication schedules (medicine name, time, frequency, date ranges).
- **`FindDoctors.jsx`:** Browse verified doctor cards filtered by specialty, navigate to profile, and initiate booking or chat.
- **`DoctorDashboard.jsx` & `DoctorProfile.jsx`:** Doctor management interface to view upcoming patient appointments and update practice availability.
- **`AdminDashboard.jsx`:** Admin verification queue to approve/reject registering doctors.
- **`ChatPage.jsx`:** Real-time messaging with client-side CryptoJS encryption (`encryptPayload`/`decryptPayload`) and document attachment capabilities. Short-polls `/get-chats` (10s) and `/get-messages` (3s).
- **`ChatAssistant.jsx`:** Floating AI chatbot (MediBot) proxying query requests to `/chat`.
- **`firebase.js` & `firebase-messaging-sw.js`:** Firebase web setup, FCM push token registration, and background web push message listener.

### 2.2 Backend API Services (`backend/app.js`)
- **Auth & Profiles:** `/signup`, `/login`, `/update-profile`, `/get-user-profile`, `/get-doctors`, `/make-me-admin`.
- **Medication Management:** `/add-tracker`, `/update-tracker/:id`, `/get-tracker`, `/delete-tracker/:id`, `/log-medication`, `/get-logs`, `/get-streak`.
- **Admin Controls:** `/get-unverified-doctors`, `/verify-doctor`, `/reject-doctor` (protected by flawed `verifyAdmin`).
- **Telemedicine & Chat:** `/get-chats`, `/get-messages/:chatId`, `/send-message`, `/edit-message`, `/book-appointment`, `/get-doctor-appointments`, `/get-patient-appointments`, `/cancel-appointment/:id`.
- **Medical Records Cloud Sync:** `/upload-medical-record`, `/get-medical-records`, `/delete-medical-record/:recordId`.
- **AI Medical Assistant:** `/chat` (NVIDIA Llama 3.1 70B integration).
- **Background Cron:** `node-cron.schedule('* * * * *')` scanning trackers every minute to trigger multi-channel alerts (`triggerFullHealthAlert`).

---

## 3. Data Flows & Security Assessment

### 3.1 Current Authentication & Authorization Flow
1. **Login:** User submits credentials to `POST /login`. Backend compares password hash using `bcrypt.compare`. Backend returns `{ user: { email, name, role } }`.
2. **Session Persistence:** Frontend saves `userEmail` and `userRole` in `localStorage`.
3. **API Access:** Frontend attaches `?email=...` or `{ email: ... }` in query parameters or request bodies.
4. **Vulnerability:** **No Firebase ID Tokens or JWTs are issued or verified.** Any caller can send an HTTP request with any user's or admin's email and manipulate or delete their data (OWASP A01: Broken Access Control).

### 3.2 Medical Document Storage Flow (Privacy Conflict)
- **Design Intent:** Local-first zero-cloud document storage using browser `IndexedDB` (`localforage`).
- **Implementation Flaw:** `app.js` defines backend endpoints (`/upload-medical-record`) accepting Base64 files directly into Firestore. Storing raw Base64 files in Firestore exposes sensitive health files to server breach risks and violates the 1MB Firestore document limit.

### 3.3 Messaging & Encryption Architecture
- **Encryption Algorithm:** AES-256 via CryptoJS (`encryptPayload`).
- **Key Derivation:** `${SYSTEM_PEPPER}_${chatId}`. `SYSTEM_PEPPER` defaults to hardcoded string `"MediTrack_Super_Secret_Default_Pepper_99xyz"`.
- **Flaws:**
  1. Static fallback secret means anyone with client code access can derive AES keys.
  2. Message editing (`PUT /edit-message`) transmits `newText` in **plaintext**, writing unencrypted text directly into Firestore and leaking E2EE content.

### 3.4 Scheduled Notifications & Serverless Deployment Risk
- `node-cron` runs in-process inside `backend/app.js`.
- On Vercel Serverless environment, instances freeze when HTTP responses complete. Background `node-cron` jobs will **never fire** on serverless platforms.

---

## 4. Categorized Vulnerabilities & Technical Debt

### 🔴 Critical Issues (Severity 10/10)
1. **Broken Authentication & Access Control:** Backend API routes accept unverified `email` inputs without validating Bearer tokens.
2. **Public Admin Backdoor (`/make-me-admin`):** Allows any unauthenticated user to instantly elevate their role to `admin`.
3. **Broken Admin Authorization Header:** `AdminDashboard.jsx` sends `headers: { "admin-email": ... }`, but backend `verifyAdmin` looks for `req.body.email`/`req.query.email`, breaking doctor approvals with HTTP 400 errors.

### ⚠️ High-Risk Issues (Severity 8/10)
4. **Plaintext E2EE Leak during Edits:** Message edits send unencrypted text to `/edit-message`.
5. **Static Hardcoded Fallback Key Pepper:** Client encryption uses fallback string in JS bundle.
6. **Contradictory Cloud Medical Document Endpoints:** Storing Base64 files in Firestore risks 1MB limit crashes and cloud leakage.
7. **Serverless Cron Incompatibility:** `node-cron` does not execute continuously on serverless functions.

### 🟡 Medium-Risk Issues (Severity 6/10)
8. **Wildcard CORS & 50MB Payload Limits:** `cors()` permits all origins, and `express.json({ limit: '50mb' })` risks memory DoS.
9. **Missing AI API Rate Limiting:** `/chat` route proxies to NVIDIA Llama 3.1 without rate limits or token caps.
10. **Insecure Nodemailer TLS Config:** `rejectUnauthorized: false` permits MITM attacks during SMTP transport.

### 🟢 Low-Risk Issues (Severity 4/10)
11. **Chat Short-Polling Overhead:** 3s/10s HTTP GET polling causes unnecessary battery and server strain.
12. **Absence of Test Infrastructure:** No unit, integration, or E2EE tests exist in the repository.

---

## 5. Recommended Phase Execution Order

1. **Phase 1 (Security First):** Implement Firebase Admin token middleware (`authenticateToken`), enforce role-based access (`requireRole`), eliminate `/make-me-admin`, fix `verifyAdmin` headers, restrict CORS, and reduce payload limits.
2. **Phase 2 (Data Privacy):** Clean up backend medical document endpoints, enforce client-side `IndexedDB` local storage, and define data classification map.
3. **Phase 3 (Encryption & Secure Chat):** Fix message editing E2EE, eliminate static fallbacks, and accurately document client-side encrypted messaging model.
4. **Phase 4 (Auth & User Management):** Refactor frontend auth state to handle Firebase tokens and update doctor verification status workflow.
5. **Phase 5 (Medication Adherence Engine):** Add dosage, status (taken/missed/skipped/snoozed), adherence %, streaks, and analytics calculations.
6. **Phase 6 & 7 (Multi-Channel Alerts & Serverless Cron):** Build escalation fallback engine and implement Vercel-compatible cron webhook handler (`/api/cron/check-reminders`).
7. **Phase 8 & 9 (Doctors, Appointments & Telemedicine):** Upgrade doctor profiles, status state machine, double-booking prevention, and secure Jitsi room token creation.
8. **Phase 10 & 11 (Document Vault & Dashboards):** Enhance local file metadata/previews and update dashboards with genuine application metrics.
9. **Phase 12 & 13 (AI & Business Metrics):** Rate-limit AI, add medical disclaimers, and build product metrics engine.
10. **Phase 14–17 (About MediTrack, Testing & Docs):** Build product overview modal/page, create comprehensive Vitest/Jest integration test suite, and finalize documentation.
