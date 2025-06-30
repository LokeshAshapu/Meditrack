const express =require('express');
const app = express();

const mongoose = require('mongoose');
const cors = require('cors');

app.cors(cors());
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/meditrack');

const trackerSchema = new mongoose.Schema({
    email: { type: String, required: true },
    time: { type: Date, required: true }
});

module.exports = mongoose.model("Tracker", trackerSchema);

const uri = "mongodb://localhost:27017/meditrack";
const client = new MongoClient(uri);

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