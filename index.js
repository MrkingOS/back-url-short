const express = require('express');
const mongoose = require('mongoose');
const urlRoutes = require('./routes/urlRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/urlShortener';

app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/', urlRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
