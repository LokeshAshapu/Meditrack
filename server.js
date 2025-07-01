const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas URI (with @ replaced by %40)
const mongoUri = 'mongodb+srv://lokeshashapu:Loki_%40506@cluster0.57zntl1.mongodb.net/meditrack?retryWrites=true&w=majority';

mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Tracker Schema & Model
const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicine: { type: String, required: true },
    time: { type: String, required: true }
});

const Tracker = mongoose.model("Tracker", trackerSchema);

// ✅ POST route to insert data
app.post('/add-tracker', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const newEntry = new Tracker({ email });
        await newEntry.save();
        res.json({ message: '✅ Tracker saved successfully', data: newEntry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET route to retrieve data
app.get('/trackers', async (req, res) => {
    try {
        const data = await Tracker.find().sort({ time: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Test route
app.get('/', (req, res) => {
    res.send('🚀 Server is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🌐 Server is running on http://localhost:${PORT}`);
});
