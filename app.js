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

const mongoUri =
    "mongodb+srv://lokeshashapu:Loki_%40506@cluster0.57zntl1.mongodb.net/meditrack?retryWrites=true&w=majority";
mongoose
    .connect(mongoUri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        console.log("✅ User created:", newUser.email);
        return res.status(201).json({
            message: "User created successfully",
            user: { email: newUser.email },
        });
    } catch (error) {
        console.error("❌ Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        console.log("✅ User logged in:", user.email);
        return res
            .status(200)
            .json({ message: "Login successful", user: { email: user.email } });
    } catch (error) {
        console.error("❌ Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicine: { type: String, required: true },
    time: { type: String, required: true },
});
const Tracker = mongoose.model("Tracker", trackerSchema);
app.post("/add-tracker", async (req, res) => {
    const { email, medicine, time } = req.body;
    try {
        if (!email || !medicine || !time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        await Tracker.create({ email, medicine, time });
        return res.json({ message: "Tracker saved successfully" });
    } catch (error) {
        console.error("❌ Error saving tracker:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/get-tracker", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const trackers = await Tracker.find({
            email: email.trim().toLowerCase(),
        });
        res.json({ data: trackers });
    } catch (error) {
        console.error("Error fetching trackers:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/delete-tracker/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTracker = await Tracker.findByIdAndDelete(id);
        if (!deletedTracker) {
            return res.status(404).json({ message: "Tracker not found" });
        }
        return res
            .status(200)
            .json({ message: "Tracker deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting tracker:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendReminder(to, medicine, time) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: "💊 Medicine Reminder",
            text: `Hey! It's time to take your medicine: ${medicine} at ${time}`,
        });
        console.log(`📧 Reminder sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}`, error);
    }
}
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

// Serve static files from React build
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});