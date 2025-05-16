// server.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const userRoutes    = require('./routes/users');
const petsRoutes    = require('./routes/pets');
const postRoutes    = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── 1) GLOBAL MIDDLEWARE ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());    // ← MUST be *before* any app.use('/…', …)

// ─── 2) DATABASE ─────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── 3) ROUTES ───────────────────────────────────────────────────────────────
app.use('/users',    userRoutes);
app.use('/pets',     petsRoutes);
app.use('/posts',    postRoutes);      // ← your POST /posts with auth lives here
app.use('/comments', commentRoutes);

// ─── 4) HEALTHCHECK & 404 ───────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Backend server is running'));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── 5) ERROR HANDLER ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// ─── 6) START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
