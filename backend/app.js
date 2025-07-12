const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
require("dotenv").config();
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 👤 User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// 🔐 Signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });
    return res.status(201).json({ message: "User created successfully", user: { email: newUser.email } });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 🔓 Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    const isPasswordMatch = user && await bcrypt.compare(password, user.password);
    if (!user || !isPasswordMatch) return res.status(401).json({ message: "Invalid email or password" });

    return res.status(200).json({ message: "Login successful", user: { email: user.email } });
  } catch (error) {
    console.error("❌ Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 💊 Tracker schema
const trackerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  medicine: { type: String, required: true },
  time: { type: String, required: true }, // format: "HH:MM"
});
const Tracker = mongoose.model("Tracker", trackerSchema);

// ➕ Add tracker
app.post("/add-tracker", async (req, res) => {
  const { email, medicine, time } = req.body;
  try {
    if (!email || !medicine || !time) return res.status(400).json({ message: "Missing required fields" });

    await Tracker.create({ email, medicine, time });
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
    if (!email) return res.status(400).json({ message: "Email is required" });

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
    if (!deletedTracker) return res.status(404).json({ message: "Tracker not found" });
    return res.status(200).json({ message: "Tracker deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting tracker:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 📧 Gmail transporter with App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lokeshashapu@gmail.com", // Your Gmail address
    pass: "sfsrctemjwnoolch", // App Password (NOT your Gmail login password)
  },
});
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS); // ⚠️ Only for debugging

// 💌 Reminder function
async function sendReminder(to, medicine, time) {
  try {
    await transporter.sendMail({
      from: "lokeshashapu@gmail.com",
      to: `${to}`,
      subject: "💊 Medicine Reminder",
      text: `Hey! This is a reminder to take your medicine: ${medicine} at ${time}.`,
    });
    console.log(`📧 Reminder sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`, error);
  }
}

// ⏰ Schedule checker: runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  console.log(`⏱️ Checking reminders for ${currentTime}`);

  try {
    const trackers = await Tracker.find({ time: currentTime });
    for (const tracker of trackers) {
      await sendReminder(tracker.email, tracker.medicine, tracker.time);
    }
  } catch (error) {
    console.error("❌ Error during scheduled check:", error);
  }
});

// 🔗 Frontend static path
const publicPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(publicPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
