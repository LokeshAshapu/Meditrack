# MediTrack Deployment & Infrastructure Guide

**Document Version:** 1.0  
**Target Environments:** Vercel (Frontend & Serverless Backend), Render / Railway (Containerized Node.js), Nixpacks

---

## 1. Environment Variables Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Server Port
PORT=5000

# Security & CORS
JWT_SECRET=your_super_secret_hmac_key_2026
ALLOWED_ORIGINS=http://localhost:5173,https://meditrack-app.vercel.app

# Firebase Service Account (JSON string for Production)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"meditrack-loki",...}

# Twilio Telephony Credentials
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+18005550199

# Email SMTP Credentials (Nodemailer)
EMAIL_USER=your-service-email@gmail.com
EMAIL_PASS=your-app-password

# NVIDIA Llama AI API Key
NVIDIA_API_KEY=nvapi-your_nvidia_llama_key

# Cron Webhook Secret
CRON_SECRET=your_cron_webhook_secret_key
```

### Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_BASE=http://localhost:5000
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=meditrack-loki.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=meditrack-loki
VITE_FIREBASE_STORAGE_BUCKET=meditrack-loki.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=905360996991
VITE_FIREBASE_APP_ID=1:905360996991:web:...
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_E2EE_KEY=your_client_encryption_pepper_v2026
```

---

## 2. Serverless Cron & Scheduled Webhooks

On Vercel serverless functions, background timers (`node-cron`) do not execute continuously. Configure Vercel Cron or an external scheduled ping service (e.g. cron-job.org) to trigger:

- **Endpoint:** `POST https://your-backend.com/api/cron/check-reminders`
- **Schedule:** Every minute (`* * * * *`)
- **Headers:** `x-cron-secret: <CRON_SECRET>`
