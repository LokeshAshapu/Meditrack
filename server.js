const express =require('express');
const app = express();

const mongoose = require('mongoose');
const cors = require('cors');

app.cors(cors());
app.use(express.json());
