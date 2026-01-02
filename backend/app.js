const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
require("dotenv").config();
const path = require("path");

// --- 1. INITIALIZE FIREBASE ADMIN (Correct Modular Syntax) ---
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});
// --- End of Firebase Init ---

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection
const mongoUri = process.env.MONGO_URI;

// 👤 User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  fcmTokens: [{ type: String }],
});
const User = mongoose.model("User", userSchema);

// 💊 Tracker schema
const trackerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  medicine: { type: String, required: true },
  time: { type: String, required: true },
});
const Tracker = mongoose.model("Tracker", trackerSchema);


// --- Notification Functions (Email and FCM) ---

// 📧 Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use .env variable
    pass: process.env.EMAIL_PASS, // Use .env variable
  },
});

// 💌 Email Reminder function
async function sendEmailReminder(to, medicine, time) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: `${to}`,
      subject: "💊 Medicine Reminder",
      text: `Hey! This is a reminder to take your medicine: ${medicine} at ${time}.`,
    });
    console.log(`📧 Email Reminder sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`, error);
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
      // --- 2. THIS IS THE CORRECT FUNCTION NAME ---
      const response = await getMessaging().sendEachForMulticast(message);
      // --- END OF FIX ---

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
          await User.updateMany(
            { fcmTokens: { $in: invalidTokens } },
            { $pull: { fcmTokens: { $in: invalidTokens } } }
          );
        }
      }
    } catch (error) {
      console.error("❌ Error sending FCM notification:", error);
    }
  }

// --- API Routes ---

// 🔐 Signup route
app.post("/signup", async (req, res) => {
  const { email, password, phoneNumber } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      phoneNumber,
      fcmTokens: [],
    });
    return res.status(201).json({
      message: "User created successfully",
      user: { email: newUser.email },
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
    const user = await User.findOne({ email });
    const isPasswordMatch = user && (await bcrypt.compare(password, user.password));
    if (!user || !isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.status(200).json({
      message: "Login successful",
      user: { email: user.email },
    });
  } catch (error) {
    console.error("❌ Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 📱 Register FCM Token route
app.post("/register-fcm-token", async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ message: "Email and token are required" });
  }
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { $addToSet: { fcmTokens: token } }, // $addToSet prevents duplicates
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Token registered successfully" });
  } catch (error) {
    console.error("❌ Error registering FCM token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ➕ Add tracker
app.post("/add-tracker", async (req, res) => {
  const { email, medicine, time } = req.body;
  try {
    if (!email || !medicine || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
        return res.status(404).json({ message: "No user registered with this email." });
    }
    await Tracker.create({ email: user.email, medicine, time });
    return res.json({ message: "Tracker saved successfully" });
  } catch (error) {
    console.error("❌ Error saving tracker:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 📥 Get tracker for user
app.get("/get-tracker", async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const trackers = await Tracker.find({ email: email.trim().toLowerCase() });
    return res.json({ data: trackers });
  } catch (error) {
    console.error("Error fetching trackers:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ❌ Delete a tracker
app.delete("/delete-tracker/:id", async (req, res) => {
  try {
    const deletedTracker = await Tracker.findByIdAndDelete(req.params.id);
    if (!deletedTracker) {
      return res.status(404).json({ message: "Tracker not found" });
    }
    return res.status(200).json({ message: "Tracker deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting tracker:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// --- Start Server and Cron Job AFTER DB connection ---

mongoose
  .connect(mongoUri) // Removed deprecated options
  .then(() => {
    console.log("✅ MongoDB connected");

    // 🚀 Start server ONLY after DB is connected
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    // ⏰ Schedule checker ONLY after DB is connected
    cron.schedule("* * * * *", async () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      
      console.log(`⏱️ Checking reminders for ${currentTime}`);

      try {
        const trackers = await Tracker.find({ time: currentTime });
        
        for (const tracker of trackers) {
          // 1. Send email reminder
          await sendEmailReminder(tracker.email, tracker.medicine, tracker.time);

          // 2. Find user to get their FCM tokens
          const user = await User.findOne({ email: tracker.email });

          // 3. Send FCM push notification
          if (user && user.fcmTokens.length > 0) {
            await sendFcmNotification(user.fcmTokens, tracker.medicine, tracker.time);
          }
        }
      } catch (error) {
        console.error("❌ Error during scheduled check:", error);
      }
    });

    // --- Frontend Serving ---
    // This serves the built React app
    const publicPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(publicPath));

    // This handles all other routes and sends them to the React app
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });

  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });