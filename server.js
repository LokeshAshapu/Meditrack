const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = 'mongodb+srv://lokeshashapu:Loki_%40506@cluster0.57zntl1.mongodb.net/meditrack?retryWrites=true&w=majority';

mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicine: { type: String, required: true },
    time: { type: String, required: true },
});
const Tracker = mongoose.model('Tracker', trackerSchema);

app.post("/add-tracker", async (req, res) => {
    const { email, medicine, time } = req.body;

    try {
        if (!email || !medicine || !time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        await Tracker.create({ email, medicine, time });
        res.json({ message: "Tracker saved successfully" });
    } catch (error) {
        console.error("❌ Error saving tracker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/get-tracker', async (req, res) => {
    try {
        const data = await Tracker.find();
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trackers', error });
    }
});

app.delete('/delete-tracker/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTracker = await Tracker.findByIdAndDelete(id);
        if (!deletedTracker) {
            return res.status(404).json({ message: "Tracker not found" });
        }
        res.status(200).json({ message: "Tracker deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting tracker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/", (req, res) => {
    res.send("Server is running...");
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendReminder = async (to, medicine, time) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: '💊 Medicine Reminder',
            text: `Hey! It's time to take your medicine: ${medicine} at ${time}`
        });
        console.log(`📧 Reminder sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}`, error);
    }
};

cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    console.log(`⏱️ Checking reminders for ${currentTime}`);

    try {
        const trackers = await Tracker.find({ time: currentTime });
        for (const tracker of trackers) {
            await sendReminder(tracker.email, tracker.medicine, tracker.time);
        }
    } catch (error) {
        console.error('❌ Error during scheduled check:', error);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
