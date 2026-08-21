# MediTrack Data Flow & Privacy Architecture (Phase 2)

**Date:** August 21, 2026  
**Privacy Classification Model:** Hybrid Local-First & Authenticated Cloud Platform  

---

## 1. Data Classification Matrix

| Data Category | Storage Location | Encryption / Security | Privacy Guarantee |
| :--- | :--- | :--- | :--- |
| **A. Sensitive Medical Documents** (Prescriptions, Lab Tests, Scans) | **Local-Only** Browser `IndexedDB` (`localforage`) | Client-side isolation; zero server upload | Private to user device; no cloud leakage |
| **B. Application Data** (Medication schedules, logs, streaks) | Backend Firestore Database | Authenticated Bearer Tokens & Firestore Security Rules | Isolated per authenticated user identity |
| **C. Authentication Data** (Email, hashed password, profile roles) | Firestore `users` collection | `bcrypt` (cost factor 10) + HMAC SHA-256 Auth Tokens | Protected against unauthorized access |
| **D. Notification Data** (FCM tokens, phone numbers, email) | Firestore `users` collection | Encrypted transit to FCM / Twilio / Nodemailer | Used strictly for user-configured alerts |
| **E. Telemedicine Metadata** (Appointment schedules, Jitsi room IDs) | Firestore `appointments` collection | Token-based access & appointment ownership checks | Accessible only to participating Doctor and Patient |
| **F. Consultation Chat Messages** | Firestore `chats` subcollections | Client-side AES-256 payload encryption | Client-side encrypted messaging |

---

## 2. End-to-End System Data Flow Diagram

```
                             [ PATIENT USER ]
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
[ Local Vault ]            [ Authenticated API ]        [ Patient ↔ Doctor ]
 IndexedDB Browser          Bearer Token Headers         Client-Side AES-256
 Storage via localforage    to Node.js Backend           Encrypted Chat & Jitsi
    │                               │                               │
    ├─ Prescriptions                ├─ Medication Schedules         ├─ Consultations
    ├─ Lab Reports                  ├─ Adherence Logs               ├─ Direct Messaging
    └─ Medical Scans                └─ Appointments                 └─ WebRTC Video
    │                               │                               │
(Zero Cloud Leak)             [ Firestore DB ]            [ External APIs ]
                               (Users, Trackers)           (Twilio / FCM / SMTP)
```

---

## 3. Data Flow Execution Policies

1. **Medical Documents (Local-First Guarantee):**
   - User uploads PDF or image file on the Dashboard.
   - File is parsed to Base64 in memory and saved directly to the browser's `IndexedDB` key `medicalRecords_${userEmail}`.
   - **No network requests are dispatched to cloud endpoints.** Legacy backend document upload endpoints (`/upload-medical-record`) return deprecation notices pointing to local storage.

2. **Authenticated Application State:**
   - All backend API interactions require an `Authorization: Bearer <token>` header.
   - The backend validates token claims and enforces resource ownership (`req.user.email === resource.owner`).

3. **Notification Delivery:**
   - Scheduled reminder webhooks inspect medication schedules.
   - Dispatches parallel alerts: FCM Web Push -> Twilio Voice/SMS -> Nodemailer HTML Email.
