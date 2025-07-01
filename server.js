const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Corrected MongoDB Atlas URI (escaped @)
const mongoUri = 'mongodb+srv://lokeshashapu:Loki_%40506@cluster0.57zntl1.mongodb.net/meditrack?retryWrites=true&w=majority';

mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Tracker Schema
const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    time: { type: Date, required: true }
});

const Tracker = mongoose.model('Tracker', trackerSchema);

// ✅ Example route to insert dummy data
app.post('/add-tracker', async (req, res) => {
    try {
        const { email } = req.body;
        const newEntry = new Tracker({ email, time: new Date() });
        await newEntry.save();
        res.json({ message: 'Tracker saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Basic test route
app.get('/', (req, res) => {
    res.send('Server is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
