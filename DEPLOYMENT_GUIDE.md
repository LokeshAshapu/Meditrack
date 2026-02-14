# Deploying Meditrack on Render

Follow these steps to deploy your full stack application (Backend + Frontend) on Render.

## Prerequisites
- Push your latest code (including `package.json`) to GitHub.

## Step 1: Create a Web Service
1.  Log in to [Render.com](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository (`LokeshAshapu/Meditrack` or similar).

## Step 2: Configure the Service
Use the following settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `meditrack-app` (or your choice) |
| **Region** | Singapore (or closest to you) |
| **Branch** | `main` (or `master`) |
| **Root Directory** | `.` (Leave empty) |
| **Environment** | **Node** |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

> **Note:**
> -   **Build Command**: `npm run build` (This now automatically installs backend dependencies too!)
> -   **Start Command**: `npm start` (Runs the backend)

## Step 3: Environment Variables
Scroll down to **Environment Variables** and add the following keys. **Copy values from your local `.env` files.**

| Key | Value Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `VITE_API_BASE` | Leave this **EMPTY** (value: ``) or set to `/` so it uses the same domain. |
| `EMAIL_USER` | Your email for Nodemailer |
| `EMAIL_PASS` | Your email password/app password |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number |
| `FIREBASE_...` | Add all your Firebase config keys from `backend/.env` |

## Step 4: Deploy
1.  Click **Create Web Service**.
2.  Wait for the build to finish.
3.  Once deployed, Render will give you a URL (e.g., `https://meditrack-app.onrender.com`).
4.  Open that URL, and your app should be live!

## Troubleshooting
-   If you see "Cannot find module", ensure you updated the **Build Command** to `npm run build`.
-   If images/assets are missing, ensure `backend/app.js` is correctly serving `../frontend/dist`.
