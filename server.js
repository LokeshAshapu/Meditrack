const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = 'mongodb+srv://lokeshashapu:Loki_@506@cluster0.57zntl1.mongodb.net/meditrack?retryWrites=true&w=majority';

mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema
const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicine: { type: String, required: true },
    time: { type: String, required: true },
});

const Tracker = mongoose.model('Tracker', trackerSchema);

// POST route to add a tracker entry
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

// Health check
app.get("/", (req, res) => {
    res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
