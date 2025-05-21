// server.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
<<<<<<< HEAD
=======

const userRoutes    = require('./routes/users');
const petsRoutes    = require('./routes/pets');
const postRoutes    = require('./routes/posts');
const commentRoutes = require('./routes/comments');
>>>>>>> origin/Creating-Feed-Posts

const app = express();
const PORT = process.env.PORT || 5001;

<<<<<<< HEAD
// ─── MIDDLEWARE ─────────────────────────────────────────
=======
// ─── 1) GLOBAL MIDDLEWARE ───────────────────────────────────────────────────
>>>>>>> origin/Creating-Feed-Posts
app.use(cors());
app.use(express.json());    // ← MUST be *before* any app.use('/…', …)

<<<<<<< HEAD
// ─── DATABASE ───────────────────────────────────────────
=======
// ─── 2) DATABASE ─────────────────────────────────────────────────────────────
>>>>>>> origin/Creating-Feed-Posts
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

<<<<<<< HEAD
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
=======
// ─── 3) ROUTES ───────────────────────────────────────────────────────────────
app.use('/users',    userRoutes);
app.use('/pets',     petsRoutes);
app.use('/posts',    postRoutes);      // ← your POST /posts with auth lives here
app.use('/comments', commentRoutes);

// ─── 4) HEALTHCHECK & 404 ───────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Backend server is running'));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── 5) ERROR HANDLER ────────────────────────────────────────────────────────
>>>>>>> origin/Creating-Feed-Posts
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

<<<<<<< HEAD
=======
// ─── 6) START ─────────────────────────────────────────────────────────────────
>>>>>>> origin/Creating-Feed-Posts
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
