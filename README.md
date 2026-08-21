# 🏥 MediTrack Healthcare SaaS Platform (v2.4.0-pilot)

> **Current Stage:** Pilot / Commercialization-Ready Prototype  
> **Version:** `v2.4.0-pilot` | **Environment:** Pilot / Institutional Evaluation  

**MediTrack** is an advanced, privacy-first healthcare management and telemedicine SaaS platform. Designed for high medication adherence, local-first medical document isolation, secure encrypted telemedicine chat, and multi-channel emergency health alerts.

> [!NOTE]
> MediTrack is currently at a **pilot and commercialization-ready prototype stage**. It provides measurable software infrastructure for medication compliance and telemedicine workflows, but is NOT clinically certified, medically validated, or a replacement for official emergency services.

---

## 📌 Table of Contents

- [Product Overview](#-product-overview)
- [System Architecture](#-system-architecture)
- [Security & Authentication](#-security--authentication)
- [Core Features](#-core-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Deployment & Serverless Readiness](#-deployment--serverless-readiness)
- [Documentation Index](#-documentation-index)
- [Known Limitations & Development Roadmap](#-known-limitations--development-roadmap)

---

## 🚀 Product Overview

MediTrack solves critical healthcare management friction points:
1. **Medication Non-Adherence**: Multi-channel escalation alerts (FCM Web Push ➔ Automated Twilio Voice Call ➔ SMS ➔ HTML Email Cards).
2. **Medical Privacy & Data Sovereignty**: Local-first document vault using browser `IndexedDB` (`localforage`) ensuring sensitive medical scans and lab tests remain on-device without cloud leakage.
3. **Telemedicine Ecosystem**: Verified physician directory, AES-256 client-side encrypted messaging, and instant WebRTC video rooms (`Jitsi`).
4. **Real-time Business & Adherence Analytics**: Executive dashboard tracking adherence rates, consultation stats, and network health.

---

## 🛠️ System Architecture

```
[ Frontend: React 19 + Vite + Tailwind CSS ]
         │
         ├──────► [ Local-First Browser Storage: IndexedDB (localforage) ]
         │         (Medical Vault: Scans, Prescriptions, Lab Reports)
         │
         ├──────► [ Client Cryptography & WebRTC ]
         │         (AES-256 Client Payload Encryption, Jitsi Video Rooms)
         │
         └──────► [ Backend API: Node.js 22 + Express 5 ]
                   ├── Auth Guard: Token Verification & RBAC Middleware
                   ├── Firebase Admin SDK (Firestore Database)
                   ├── Multi-Channel Engine: Twilio Voice & SMS, Nodemailer, FCM
                   ├── AI Assistant: NVIDIA Llama 3.1 70B Rate-Limited Proxy
                   └── Serverless Scheduler: Webhook Cron & Audit Logger
```

---

## 🔐 Security & Authentication

- **Token-Based Authentication**: All protected API endpoints require `Authorization: Bearer <token>` validated via `firebase-admin/auth` and HMAC SHA-256 signatures.
- **Role-Based Access Control (RBAC)**: Strict role guards for `patient`, `doctor`, and `admin`.
- **IDOR Protection**: Backend middleware enforces resource ownership (`req.user.email === resource.owner`).
- **Encrypted Messaging**: Client-side AES-256 payload encryption with encrypted edit operations.
- **DoS & API Protection**: Express JSON payload limits set to 10MB; rate-limiting guards sensitive AI and auth routes.

---

## 📤 Getting Started

### 1. Prerequisites
- Node.js v18+ 
- Firebase Project & Firebase Service Account Key
- Twilio & Nodemailer SMTP credentials (optional for alerts)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```

---

## 🧪 Testing & Quality Assurance

Run the automated backend security and authorization test suite:

```bash
node backend/tests/security_and_auth.test.js
```

Runs 4 automated verification tests:
1. Auth Token Generation & Verification
2. Expired Token Rejection
3. IDOR Resource Ownership Verification
4. Role-Based Authorization Guards

---

## 🌐 Deployment & Serverless Readiness

- **Frontend Deployment**: Deploys natively to Vercel or Netlify (`vite build`).
- **Backend Deployment**: Ready for Vercel Serverless Functions, Render, or Railway.
- **Serverless Reminders**: Use Vercel Cron or an external ping service to trigger `POST /api/cron/check-reminders` with `x-cron-secret` header once per minute.

---

## 📚 Documentation Index

- 📄 [Current State Audit](docs/meditrack-current-state-audit.md)
- 📄 [Security Remediation Report](docs/meditrack-security-remediation.md)
- 📄 [Data Flow & Privacy Architecture](docs/meditrack-data-flow.md)
- 📄 [API Security & RBAC Matrix](docs/meditrack-api-security.md)
- 📄 [Business Metrics & Incubation Analytics](docs/meditrack-business-metrics.md)
- 📄 [Deployment Guide](docs/meditrack-deployment.md)
- 📄 [Testing Infrastructure](docs/meditrack-testing.md)
- 📄 [Product Roadmap](docs/meditrack-product-roadmap.md)

---

## ⚠️ Known Limitations & Development Roadmap

1. **Browser-Dependent Local Storage**: IndexedDB storage is scoped to the user's specific browser and device. Clearing browser data will reset local document caches unless exported.
2. **Telephony Credentials**: Voice and SMS alerts require an active Twilio account with verified numbers in sandbox mode.
