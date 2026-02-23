const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
require("dotenv").config();
const path = require("path");
const twilio = require("twilio"); // Import Twilio

// --- 1. INITIALIZE FIREBASE ADMIN (Correct Modular Syntax) ---
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: load credentials from environment variable (Render, etc.)
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("✅ Firebase credentials loaded from environment variable.");
    } catch (e) {
        console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var. Make sure it is valid JSON.", e);
        process.exit(1);
    }
} else {
    // Local development: fall back to local file
    try {
        serviceAccount = require("./serviceAccountKey.json");
        console.log("✅ Firebase credentials loaded from serviceAccountKey.json (local dev).");
    } catch (e) {
        console.error("❌ serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env var is not set. Cannot start server.", e);
        process.exit(1);
    }
}

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
// --- End of Firebase Init ---

// --- 2. INITIALIZE TWILIO ---
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Notification Functions (Email, FCM, Voice, SMS) ---

// 📧 Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Use .env variable
        pass: process.env.EMAIL_PASS, // Use .env variable
    },
    tls: {
        rejectUnauthorized: false
    }
});

// 💌 Email Reminder function
async function sendEmailReminder(to, medicine, time) {
    const htmlContent = `
    <div style="font-family: sans-serif; background-color: #f4f7f6; padding: 20px; border-radius: 10px;">
        <div style="max-width: 400px; margin: auto; background: white; padding: 30px; border-radius: 15px; border-top: 5px solid #4A90E2; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; font-size: 40px; margin-bottom: 10px;">💊</div>
            <h2 style="text-align: center; color: #333; margin-top: 0;">Time for your Meds!</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #666; font-size: 16px; margin-bottom: 5px;">Medicine Name:</p>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin-top: 0;">${medicine}</p>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 5px;">Scheduled Time:</p>
            <p style="color: #4A90E2; font-size: 20px; font-weight: bold; margin-top: 0;">${time}</p>
            
            <div style="margin-top: 30px; text-align: center;">
                <p style="font-size: 14px; color: #999;">Stay healthy and have a great day!</p>
            </div>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Health Assistant" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: "💊 Medicine Reminder",
            text: `Reminder: Take ${medicine} at ${time}.`, // Fallback for old email clients
            html: htmlContent, // The visual card
        });
        console.log(`📧 Professional Card Reminder sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}`, error);
    }
}

// 📞 Voice SOS Function (Twilio)
async function sendSosCall(phoneNumber, medicine, time) {
    if (!phoneNumber) {
        console.log("⚠️ No phone number provided for SOS call.");
        return;
    }

    // Ensure number has country code (defaulting to +91 for India if missing)
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
        formattedNumber = `+91${formattedNumber}`;
    }

    console.log(`📞 Attempting SOS Call to: ${formattedNumber}`);

    const twiml = `
        <Response>
            <Pause length="1"/>
            <Say voice="alice" language="en-US">Attention. This is a Meditrack Health Alert.</Say>
            <Pause length="1"/>
            <Say voice="alice" language="en-US">It is time to take your medicine: ${medicine}.</Say>
            <Say voice="alice" language="en-US">Scheduled time was ${time}.</Say>
            <Pause length="1"/>
            <Say voice="alice" language="en-US">Please take your medication immediately.</Say>
            <Pause length="1"/>
            <Say voice="alice" language="en-US">Repeating.</Say>
            <Say voice="alice" language="en-US">Take ${medicine} now.</Say>
            <Pause length="1"/>
            <Say voice="alice" language="en-US">Goodbye.</Say>
        </Response>
    `;

    try {
        const call = await twilioClient.calls.create({
            twiml: twiml,
            to: formattedNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
        console.log(`✅ SOS Call initiated to ${formattedNumber}. SID: ${call.sid}`);
    } catch (error) {
        console.error(`❌ Failed to initiate SOS call to ${formattedNumber}:`);
        console.error(`   Error Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
    }
}

// 💬 SMS Alert Function (Twilio)
async function sendSosSms(phoneNumber, medicine, time) {
    if (!phoneNumber) {
        return;
    }

    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
        formattedNumber = `+91${formattedNumber}`;
    }

    console.log(`💬 Attempting SOS SMS to: ${formattedNumber}`);

    try {
        const message = await twilioClient.messages.create({
            body: `🚨 Meditrack SOS: Take ${medicine} now (${time}). Reply STOP to unsubscribe.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNumber
        });
        console.log(`✅ SOS SMS sent to ${formattedNumber}. SID: ${message.sid}`);
    } catch (error) {
        console.error(`❌ Failed to send SOS SMS to ${formattedNumber}:`, error.message);
    }
}

// 📱 FCM Notification Function
async function sendFcmNotification(tokens, medicine, time) {
    if (!tokens || tokens.length === 0) {
        return; // No devices to send to
    }

    const message = {
        notification: {
            title: "💊 Meditrack Reminder",
            body: `Time to take your medicine: ${medicine} at ${time}.`,
        },
        webpush: {
            fcm_options: {
                link: '/dashboard' // Opens dashboard on click
            }
        },
        tokens: tokens, // 'tokens' is the correct property
    };

    try {
        const response = await getMessaging().sendEachForMulticast(message);

        console.log(`📱 FCM notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);

        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(resp.error.code)) {
                    invalidTokens.push(tokens[idx]);
                }
            });
            if (invalidTokens.length > 0) {
                console.log('🧹 Cleaning up invalid FCM tokens:', invalidTokens);
            }
        }
    } catch (error) {
        console.error("❌ Error sending FCM notification:", error);
    }
}

// 🚨 MASTER ALERT FUNCTION
async function triggerFullHealthAlert(userDoc, medicine, time) {
    console.log(`🔥 TRIGGERING FULL SOS ALERT for ${userDoc.email} ---`);

    // 1. Send Professional Email Card
    sendEmailReminder(userDoc.email, medicine, time);

    // 2. Trigger Voice SOS Call & SMS (if phone number exists)
    if (userDoc.phoneNumber) {
        // Run in parallel
        sendSosCall(userDoc.phoneNumber, medicine, time);
        sendSosSms(userDoc.phoneNumber, medicine, time);
    } else {
        console.log(`⚠️ SKIPPING Voice/SMS: No phone number found for user ${userDoc.email}`);
    }

    // 3. Send High-Priority Push Notification
    if (userDoc.fcmTokens && userDoc.fcmTokens.length > 0) {
        sendFcmNotification(userDoc.fcmTokens, medicine, time);
    }
}

// --- API Routes ---

// 🔐 Signup route
app.post("/signup", async (req, res) => {
    const { email, password, phoneNumber, name, role, specialization, experience, hospital, medicalIdCard, experienceLevel } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            email,
            password: hashedPassword,
            phoneNumber: phoneNumber || "",
            name: name || "",
            role: role || "patient", // Default to patient
            fcmTokens: [],
            profilePic: ""
        };

        // If doctor, add specific fields
        if (role === 'doctor') {
            userData.specialization = specialization || "General";
            userData.experience = experience || 0;
            userData.experienceLevel = experienceLevel || "fresher";
            userData.hospital = hospital || "";
            userData.medicalIdCard = medicalIdCard || ""; // Base64 or URL
            userData.isVerified = false; // Doctors might need verification
        }

        await userRef.set(userData);

        return res.status(201).json({
            message: "User created successfully",
            user: { email, name, role: userData.role, profilePic: "" },
        });
    } catch (error) {
        console.error("❌ Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 🔓 Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const userData = userDoc.data();
        const isPasswordMatch = await bcrypt.compare(password, userData.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                email: userData.email,
                name: userData.name || "",
                phoneNumber: userData.phoneNumber || "",
                profilePic: userData.profilePic || "",
                role: userData.role || "patient"
            },
        });
    } catch (error) {
        console.error("❌ Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 👤 Update Profile Route
app.put("/update-profile", async (req, res) => {
    const { email, name, phoneNumber, profilePic, hospital, experience, specialization, experienceLevel, availability } = req.body; // Added new fields
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = {
            name: name !== undefined ? name : userDoc.data().name,
            phoneNumber: phoneNumber !== undefined ? phoneNumber : userDoc.data().phoneNumber,
            profilePic: profilePic !== undefined ? profilePic : userDoc.data().profilePic,
            // Update doctor fields if provided, otherwise keep existing
            hospital: hospital !== undefined ? hospital : (userDoc.data().hospital || ""),
            experience: experience !== undefined ? Number(experience) : (userDoc.data().experience || 0),
            specialization: specialization !== undefined ? specialization : (userDoc.data().specialization || ""),
            experienceLevel: experienceLevel !== undefined ? experienceLevel : (userDoc.data().experienceLevel || ""),
            availability: availability !== undefined ? availability : (userDoc.data().availability || "Mon - Fri: 09:00 - 17:00"),
        };

        await userRef.update(updateData);

        return res.json({ message: "Profile updated successfully", user: { email, ...updateData } });
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 👤 Get User Profile
app.get("/get-user-profile", async (req, res) => {
    const { email } = req.query;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ user: userDoc.data() });
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 👨‍⚕️ Get All Doctors Route
app.get("/get-doctors", async (req, res) => {
    try {
        const doctorsRef = db.collection('users');
        const snapshot = await doctorsRef.where('role', '==', 'doctor').get();

        if (snapshot.empty) {
            return res.json({ doctors: [] });
        }

        const doctors = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Only return public info
            doctors.push({
                name: data.name,
                email: data.email, // Needed for ID
                specialization: data.specialization,
                experience: data.experience,
                hospital: data.hospital,
                profilePic: data.profilePic || "", // Ensure this is sent
                availability: data.availability || "Mon - Fri: 09:00 - 17:00"
            });
        });

        return res.json({ doctors });
    } catch (error) {
        console.error("❌ Error fetching doctors:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 📱 Register FCM Token route
app.post("/register-fcm-token", async (req, res) => {
    const { email, token } = req.body; // ... existing code ...
    if (!email || !token) {
        return res.status(400).json({ message: "Email and token are required" });
    }
    try {
        const userRef = db.collection('users').doc(email);

        // Use arrayUnion to add unique tokens
        await userRef.update({
            fcmTokens: FieldValue.arrayUnion(token)
        });

        return res.status(200).json({ message: "Token registered successfully" });
    } catch (error) {
        console.error("❌ Error registering FCM token:", error);
        // If error is NOT_FOUND (code 5), user might not exist
        if (error.code === 5) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ➕ Add tracker
app.post("/add-tracker", async (req, res) => {
    const { email, medicine, time, frequency, selectedDays } = req.body;
    try {
        if (!email || !medicine || !time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userRef = db.collection('users').doc(normalizedEmail);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "No user registered with this email." });
        }

        await db.collection('trackers').add({
            email: normalizedEmail,
            medicine,
            time,
            frequency: frequency || "Daily",
            selectedDays: selectedDays || [],
            startDate: req.body.startDate || null,
            endDate: req.body.endDate || null
        });

        return res.json({ message: "Tracker saved successfully" });
    } catch (error) {
        console.error("❌ Error saving tracker:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ✏️ Update tracker
app.put("/update-tracker/:id", async (req, res) => {
    const { medicine, time, frequency, selectedDays } = req.body;
    try {
        const trackerRef = db.collection('trackers').doc(req.params.id);
        const doc = await trackerRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Tracker not found" });
        }

        await trackerRef.update({
            medicine,
            time,
            frequency: frequency || "Daily",
            selectedDays: selectedDays || [],
            startDate: req.body.startDate || null,
            endDate: req.body.endDate || null
        });

        return res.json({ message: "Tracker updated successfully" });
    } catch (error) {
        console.error("❌ Error updating tracker:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// --- 🛠️ Admin Routes 🛠️ ---

// 🛡️ Middleware to Verify Admin
const verifyAdmin = async (req, res, next) => {
    const { email } = req.body.email ? req.body : req.query; // Handle both GET and POST

    if (!email) {
        return res.status(400).json({ message: "Email is required for verification" });
    }

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// --- 🛠️ Admin Routes 🛠️ ---

// 1. Get Unverified Doctors
app.get("/get-unverified-doctors", verifyAdmin, async (req, res) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('role', '==', 'doctor').where('isVerified', '==', false).get();

        const doctors = [];
        snapshot.forEach(doc => {
            doctors.push(doc.data());
        });

        return res.json({ doctors });
    } catch (error) {
        console.error("Error fetching unverified doctors:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 2. Verify Doctor
app.post("/verify-doctor", verifyAdmin, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        await db.collection('users').doc(email).update({ isVerified: true });
        return res.json({ message: "Doctor verified successfully" });
    } catch (error) {
        console.error("Error verifying doctor:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 3. Reject Doctor (Delete User)
app.post("/reject-doctor", verifyAdmin, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        await db.collection('users').doc(email).delete();
        return res.json({ message: "Doctor rejected and removed" });
    } catch (error) {
        console.error("Error rejecting doctor:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 4. Setup Admin (Dev Tool)
app.post("/make-me-admin", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        await db.collection('users').doc(email).update({ role: 'admin' });
        return res.json({ message: "User promoted to Admin" });
    } catch (error) {
        console.error("Error promoting user:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 📥 Get tracker for user
app.get("/get-tracker", async (req, res) => {
    const { email } = req.query;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const snapshot = await db.collection('trackers').where('email', '==', normalizedEmail).get();

        const trackers = [];
        snapshot.forEach(doc => {
            trackers.push({ id: doc.id, ...doc.data() });
        });

        return res.json({ data: trackers });
    } catch (error) {
        console.error("Error fetching trackers:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// ❌ Delete a tracker
app.delete("/delete-tracker/:id", async (req, res) => {
    try {
        const trackerRef = db.collection('trackers').doc(req.params.id);
        const doc = await trackerRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Tracker not found" });
        }

        await trackerRef.delete();
        return res.status(200).json({ message: "Tracker deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting tracker:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// 📝 Log Medication Taken
app.post("/log-medication", async (req, res) => {
    const { email, medicine, date, status } = req.body;
    try {
        if (!email || !medicine || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Add a new log entry
        await db.collection('logs').add({
            email: normalizedEmail,
            medicine,
            date, // Format: YYYY-MM-DD
            status: status || 'taken',
            timestamp: new Date().toISOString()
        });

        return res.json({ message: "Marked as taken!" });
    } catch (error) {
        console.error("❌ Error logging medication:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 📊 Get Logs for User (Filtered by Date if provided)
app.get("/get-logs", async (req, res) => {
    const { email, date } = req.query;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let query = db.collection('logs').where('email', '==', normalizedEmail);

        if (date) {
            query = query.where('date', '==', date);
        }

        const snapshot = await query.get();
        const logs = [];
        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });

        return res.json({ data: logs });
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 🔥 Get Streak Route (Based on Daily Logins/Visits)
app.get("/get-streak", async (req, res) => {
    const { email } = req.query;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userRef = db.collection('users').doc(normalizedEmail);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.json({ streak: 0 });
        }

        const userData = userDoc.data();
        let currentStreak = userData.streak || 0;
        const lastLoginDate = userData.lastLoginDate || ""; // YYYY-MM-DD format

        // Get today's date in proper format (local time approximation for simplicity, or UTC)
        // Ideally should match client timezone, but using server time for consistency
        const d = new Date();
        // Adjust to IST (Indian Standard Time) simply by adding 5.5 hours if needed, 
        // OR just use UTC to avoid complexity. Let's use generic ISO date (YYYY-MM-DD).
        const todayStr = d.toISOString().split('T')[0];

        // 1. If already logged in today, just return current streak
        if (lastLoginDate === todayStr) {
            return res.json({ streak: currentStreak });
        }

        // 2. Check if the last login was yesterday
        const yesterday = new Date(d);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLoginDate === yesterdayStr) {
            // Consecutive day! Increment
            currentStreak += 1;
        } else {
            // Missed a day (or first time), reset/start at 1
            // Unless it's the very first time ever
            currentStreak = 1;
        }

        // 3. Update the database
        await userRef.update({
            streak: currentStreak,
            lastLoginDate: todayStr
        });

        return res.json({ streak: currentStreak });

    } catch (error) {
        console.error("❌ Error calculating streak:", error);
        return res.json({ streak: 0 });
    }
});


// 💬 Messaging Routes 💬

// 1. Get All Chats for a User
app.get("/get-chats", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        const chatsRef = db.collection('chats');
        const snapshot = await chatsRef.where('participants', 'array-contains', email).get();

        const chats = [];

        // Use Promise.all to fetch details in parallel
        const chatPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const otherEmail = data.participants.find(p => p !== email);

            let otherName = otherEmail; // Default to email
            let otherProfilePic = "";

            if (otherEmail) {
                const userDoc = await db.collection('users').doc(otherEmail).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    otherName = userData.name || otherEmail;
                    otherProfilePic = userData.profilePic || "";
                }
            }

            return {
                id: doc.id,
                ...data,
                otherName,
                otherProfilePic,
                lastMessage: data.lastMessage?.text || "No messages yet",
                lastMessageTime: data.lastMessage?.timestamp || null
            };
        });

        const resolvedChats = await Promise.all(chatPromises);

        // Sort by latest message
        resolvedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        return res.json({ chats: resolvedChats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 2. Get Messages for a specific Chat
app.get("/get-messages/:chatId", async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) return res.status(400).json({ message: "Chat ID required" });

    try {
        const messagesRef = db.collection('chats').doc(chatId).collection('messages');
        const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        return res.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 3. Send a Message (Create Chat if new)
app.post("/send-message", async (req, res) => {
    const { sender, recipient, text, chatId } = req.body;

    if (!sender || !recipient || !text) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        let finalChatId = chatId;
        let chatRef;

        // A. If no chatId, check if one exists or create new
        if (!finalChatId) {
            // Check if chat spans these two participants
            const chatsRef = db.collection('chats');
            // Firestore array-contains is simple, but exact match of two array items is hard.
            // We usually can just query for one and filter in code, or use a composite ID (email1_email2).
            // For simplicity, let's create a new doc if ID is not provided.

            // BETTER: Use composite ID to prevent duplicates: alphabetical sort
            const participants = [sender, recipient].sort();
            finalChatId = `${participants[0]}_${participants[1]}`;

            chatRef = db.collection('chats').doc(finalChatId);
            const chatDoc = await chatRef.get();

            if (!chatDoc.exists) {
                await chatRef.set({
                    participants: participants,
                    users: participants, // redundancy ok
                    createdAt: new Date().toISOString(),
                    lastMessage: { text, timestamp: new Date().toISOString(), sender }
                });
            }
        } else {
            chatRef = db.collection('chats').doc(finalChatId);
        }

        // B. Add Message to Subcollection
        const messageData = {
            sender,
            text,
            timestamp: new Date().toISOString()
        };

        await chatRef.collection('messages').add(messageData);

        // C. Update Last Message on Parent Chat Doc
        await chatRef.update({
            lastMessage: messageData
        });

        // 🔔 NOTIFICATION: Send Email to Recipient if possible
        // (In a real app, only if they are offline)
        try {
            await transporter.sendMail({
                from: `"MediTrack" <${process.env.EMAIL_USER}>`,
                to: recipient, // Assuming recipient is an email
                subject: "💬 New Message on MediTrack",
                text: `You have a new message from ${sender}: "${text}"\n\nLog in to reply: ${process.env.VITE_APP_URL || 'http://localhost:5173'}`
            });
            console.log(`📧 Message notification sent to ${recipient}`);
        } catch (notifError) {
            console.error("Failed to send message notification:", notifError);
        }

        return res.json({ message: "Sent", chatId: finalChatId });

    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 4. Edit Message
app.put("/edit-message", async (req, res) => {
    const { chatId, messageId, newText } = req.body;

    if (!chatId || !messageId || !newText) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const chatRef = db.collection('chats').doc(chatId);
        const messageRef = chatRef.collection('messages').doc(messageId);

        await messageRef.update({
            text: newText,
            isEdited: true
        });

        // Update lastMessage preview if this was the latest message
        const lastMsgQuery = await chatRef.collection('messages').orderBy('timestamp', 'desc').limit(1).get();
        if (!lastMsgQuery.empty) {
            if (lastMsgQuery.docs[0].id === messageId) {
                await chatRef.update({
                    "lastMessage.text": newText
                });
            }
        }

        return res.json({ message: "Updated" });
    } catch (error) {
        console.error("Error editing message:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


// 💳 Payment Routes (Razorpay)
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/create-order", async (req, res) => {
    const { amount, currency } = req.body;

    // Amount must be in subunits (paise for INR, cents for USD)
    const options = {
        amount: amount * 100,
        currency: currency || "INR",
        receipt: "receipt_" + Math.random().toString(36).substr(2, 9)
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
});

app.post("/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        res.json({ status: "success", message: "Payment verified" });
    } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
});


// 📅 Appointment Routes 📅

// 1. Book Appointment
app.post("/book-appointment", async (req, res) => {
    const { doctorId, patientId, patientName, date, time, status } = req.body;

    if (!doctorId || !patientId || !date || !time) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        await db.collection('appointments').add({
            doctorId,  // Doctor's email
            patientId, // Patient's email
            patientName: patientName || "Unknown Patient",
            date,
            time,
            status: status || "confirmed", // Default to confirmed as per request
            createdAt: new Date().toISOString()
        });

        // 🔔 NOTIFICATION: Send Confirmation Email
        try {
            await transporter.sendMail({
                from: `"MediTrack" <${process.env.EMAIL_USER}>`,
                to: patientId,
                subject: "✅ Appointment Confirmed",
                html: `
                    <h2>Appointment Confirmed!</h2>
                    <p>You have successfully booked an appointment with <b>${doctorId}</b>.</p>
                    <p><b>Date:</b> ${date}</p>
                    <p><b>Time:</b> ${time}</p>
                    <br/>
                    <p>Please join the video call from your dashboard at the scheduled time.</p>
                `
            });
            console.log(`📧 Appointment confirmation sent to ${patientId}`);
        } catch (emailError) {
            console.error("Failed to send appointment confirmation:", emailError);
        }

        return res.json({ message: "Appointment booked successfully" });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 2. Get Doctor's Appointments
app.get("/get-doctor-appointments", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Doctor email required" });

    try {
        const appointmentsRef = db.collection('appointments');
        // Get appointments for this doctor, ideally for today or upcoming.
        // For now, get all and let frontend filter or just show recent.
        const snapshot = await appointmentsRef.where('doctorId', '==', email).get();

        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });

        // Sort by date/time descending (newest first)
        appointments.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        return res.json({ appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// 3. Get Patient's Appointments
app.get("/get-patient-appointments", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Patient email required" });

    try {
        const appointmentsRef = db.collection('appointments');
        const snapshot = await appointmentsRef.where('patientId', '==', email).get();

        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });

        // Sort: Upcoming soonest first, then past
        appointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        return res.json({ appointments });
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

const OpenAI = require('openai');

app.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: "I didn't receive a message." });
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
        });

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: `You are MediBot — an intelligent, safety-focused medical information assistant. Your goal is to help users understand medicines, their purposes, usage guidelines, drug interactions, safety considerations, side effects, and general medical information.
                    
                    RULES:
                    1. Core Capabilities: Explain medicine use cases, mechanisms, and safety. Provide standard dosage ranges ONLY if universally standard. Answer general medical questions with evidence-based explanations.
                    2. Safety Rules: Do NOT diagnose diseases or recommend specific personalized dosages. ALWAYS encourage seeking a professional. Warn users when a question requires medical supervision.
                    3. Specifics: If a drug name is mentioned, include: Overview, How it works, Common uses, Side effects, Warnings, Interactions, When to seek help.
                    4. Tone: Professional, empathetic, clear, non-technical unless asked.
                    5. Refusals: If dangerous, refuse clearly and offer a safe alternative.
                    
                    Follow the structure:
                    - **Overview**
                    - **Common Uses**
                    - **Safety & Side Effects**
                    - **Important Warnings**
                    
                    Interaction Style:
                    - Maintain conversation memory across turns.
                    - Be helpful, approachable, and supportive, but clear on medical boundaries.`
                },
                { role: "user", content: message }
            ],
            temperature: 0.2,
            top_p: 0.7,
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content || "I'm having trouble thinking right now.";
        return res.json({ reply });

    } catch (error) {
        console.error("❌ AI Error:", error);
        // Fallback to mock if API fails (e.g., quota exceeded or network)
        return res.status(500).json({ reply: "My connection to the medical database is currently unstable. Please try again later." });
    }
});

// --- Start Server and Cron Job ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// ⏰ Schedule checker
cron.schedule("* * * * *", async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    // Get current day name (e.g., "Monday")
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[now.getDay()];

    console.log(`⏱️ Checking reminders for ${currentTime} (${currentDay})`);

    try {
        const snapshot = await db.collection('trackers').where('time', '==', currentTime).get();

        if (snapshot.empty) {
            return;
        }

        for (const doc of snapshot.docs) {
            const tracker = doc.data();

            // 🗓️ DATE RANGE & AUTO-DELETION CHECK
            const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

            if (tracker.endDate && tracker.endDate < todayStr) {
                console.log(`🗑️ Auto-deleting expired tracker: ${doc.id} (Ended: ${tracker.endDate})`);
                await db.collection('trackers').doc(doc.id).delete();
                continue; // Skip processing this tracker
            }

            if (tracker.startDate && tracker.startDate > todayStr) {
                // Not yet started
                continue;
            }

            // 🗓️ CHECK FREQUENCY LOGIC
            let shouldTrigger = false;

            if (!tracker.frequency || tracker.frequency === "Daily") {
                shouldTrigger = true;
            } else if (tracker.frequency === "Specific Days" && tracker.selectedDays) {
                if (tracker.selectedDays.includes(currentDay)) {
                    shouldTrigger = true;
                }
            }

            if (shouldTrigger) {
                // Fetch user details for phone number and tokens
                const userRef = db.collection('users').doc(tracker.email);
                const userDoc = await userRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // 🔥 Trigger the Master SOS Alert
                    await triggerFullHealthAlert(userData, tracker.medicine, tracker.time);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error during scheduled check:", error);
    }
});

// ==================== MEDICAL RECORDS ENDPOINTS ====================

// 📤 Upload Medical Record
app.post("/upload-medical-record", async (req, res) => {
    const { patientEmail, title, description, fileData, fileName } = req.body;

    if (!patientEmail || !title || !fileData) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const recordRef = await db.collection('medicalRecords').add({
            patientEmail,
            title,
            description: description || "",
            fileData, // Base64 encoded file
            fileName: fileName || "document",
            uploadedAt: new Date().toISOString()
        });

        res.status(200).json({
            message: "Medical record uploaded successfully",
            recordId: recordRef.id
        });
    } catch (error) {
        console.error("Error uploading medical record:", error);
        res.status(500).json({ message: "Failed to upload medical record" });
    }
});

// 📥 Get Medical Records for a Patient
app.get("/get-medical-records", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const snapshot = await db.collection('medicalRecords')
            .where('patientEmail', '==', email)
            .orderBy('uploadedAt', 'desc')
            .get();

        const records = [];
        snapshot.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ records });
    } catch (error) {
        console.error("Error fetching medical records:", error);
        res.status(500).json({ message: "Failed to fetch medical records" });
    }
});

// 🗑️ Delete Medical Record
app.delete("/delete-medical-record/:recordId", async (req, res) => {
    const { recordId } = req.params;

    if (!recordId) {
        return res.status(400).json({ message: "Record ID is required" });
    }

    try {
        await db.collection('medicalRecords').doc(recordId).delete();
        res.status(200).json({ message: "Medical record deleted successfully" });
    } catch (error) {
        console.error("Error deleting medical record:", error);
        res.status(500).json({ message: "Failed to delete medical record" });
    }
});

// ==================== END OF MEDICAL RECORDS ====================


// --- Frontend Serving ---
// This serves the built React app
const publicPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(publicPath));

// This handles all other routes and sends them to the React app
app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});