// server.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── MIDDLEWARE ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── DATABASE ───────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── ROUTES ─────────────────────────────────────────────
const userRoutes = require('./routes/users');
const petRoutes  = require('./routes/pets');

// Mount the routers under distinct base paths:
app.use('/api/users', userRoutes);
app.use('/api/pets',  petRoutes);

// ─── HEALTH CHECK ───────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🐾 Pawsibilities API is up and running!');
});

// ─── ERROR HANDLER ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
