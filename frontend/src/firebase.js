import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to get the token and send it to your backend
export const requestPermissionAndToken = async () => {
  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied.");
      alert("Please enable notifications to receive reminders.");
      return;
    }

    // 2. Get token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.log("No registration token available. Request permission to generate one.");
      return;
    }

    console.log("FCM Token:", token);

    // 3. Send token to backend
    const email = localStorage.getItem("userEmail");
    if (!email) {
      console.log("User not logged in, can't register token.");
      return; // We'll try again on login
    }

    await fetch(`${import.meta.env.VITE_API_BASE}/register-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, token }),
    });

    console.log("FCM Token sent to backend.");

  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
  }
};

// Listen for messages when the app is in the foreground
onMessage(messaging, (payload) => {
  console.log("Message received in foreground: ", payload);

  // Play the SOS Sound
  const audio = new Audio('/thunder_alert.wav');
  audio.play().catch(err => console.error("Error playing sound:", err));

  // Show alert
  alert(`🚨 SOS ALERT: ${payload.notification.body}`);
});