# MediTrack Production Environment & Deployment Configuration (Phase 17)

**Document Version:** 1.0  
**Scope:** Production environment variables schema, security guidelines, and deployment configuration.

---

## 1. Required Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Description | Sample Template |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | HTTP listening port for Express backend | `5000` |
| `JWT_SECRET` | Yes | Secret passphrase used for signing HMAC-SHA256 Auth tokens | `<random_64_char_hex_string>` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of trusted cross-origin domains for CORS | `https://meditrack.example.com` |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | Compacted JSON string of Firebase Admin Service Account | `{"type":"service_account",...}` |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio Account SID for Voice/SMS escalation | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio Auth Token | `<twilio_auth_token>` |
| `TWILIO_PHONE_NUMBER` | Optional | E.164 formatted Twilio phone number | `+18005550199` |
| `EMAIL_USER` | Optional | Nodemailer SMTP sender Gmail address | `alerts@meditrack.example.com` |
| `EMAIL_PASS` | Optional | Gmail App-Specific Password | `<app_password>` |
| `NVIDIA_API_KEY` | Optional | NVIDIA Llama 3.1 70B AI integration key | `nvapi-xxxxxxxxxxxxxxxx` |
| `CRON_SECRET` | Yes | Webhook secret header for Vercel Cron execution | `<random_cron_secret>` |
| `PILOT_MODE` | Yes | Enables pilot deployment observability, audit logging & status | `true` |

---

## 2. Required Frontend Environment Variables (`frontend/.env`)

| Variable Name | Required | Description | Sample Template |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE` | Yes | Full URL of Node.js Express backend API | `https://api.meditrack.example.com` |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web Client API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Web Auth Domain | `meditrack-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase Project Identifier | `meditrack-app` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Yes | Firebase Storage Bucket | `meditrack-app.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM Sender ID | `905360996991` |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web App ID | `1:905360996991:web:...` |
| `VITE_E2EE_KEY` | Yes | Salt pepper for client-side AES-256 chat payload encryption | `<client_salt_pepper_v2026>` |
