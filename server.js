const express =require('express');
const app = express();
const { MongoClient } = require('mongodb');


const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json());
// mongoose.connect("mongodb://localhost:27017/meditrack", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });
const mongoUri='mongodb+srv://lokeshashapu:Loki_@506@cluster0.57zntl1.mongodb.net/meditrack?retryWrites=true&w=majority';
mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));



const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    time: { type: Date, required: true }
});

module.exports = mongoose.model("Tracker", trackerSchema);

const localUri = "mongodb://localhost:27017/meditrack";
const client = new MongoClient(localUri);

async function run() {
    await client.connect();
    const db = client.db("meditrack");
    const collection = db.collection("tracker");

await collection.insertOne({
    email: "user@example.com",
    time: new Date()
});

await client.close();
}

run();

app.get('/', (req, res) => {
    res.send('Surver is running.....');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});