// server.js
require('dotenv').config();      // ← loads your .env into process.env
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const User          = require('./models/User');    // ← for syncIndexes
const userRoutes    = require('./routes/users');
const petsRoutes    = require('./routes/pets');
const postRoutes    = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const lostPetRoutes = require('./routes/lostPets');
const matchRoutes   = require('./routes/matches');
const reportRoutes  = require('./routes/reports');

const app  = express();
const PORT = process.env.PORT || 5001;

// ─── 1) MIDDLEWARE ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());         // for parsing JSON bodies

// ─── 2) DB CONNECT & SERVER BOOT ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  autoIndex: false,             // ← disable automatic index creation
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // Drop any indexes not in your schema (e.g. userName_1), then build only the ones you want
  const res = await User.syncIndexes();
  console.log('🔄 User indexes synchronized:', res);

  // Now that DB is in the correct state, start listening:
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ─── 3) ROUTES ──────────────────────────────────────────────────────────
app.use('/users',    userRoutes);
app.use('/pets',     petsRoutes);
app.use('/posts',    postRoutes);
app.use('/comments', commentRoutes);
app.use('/reports',  reportRoutes);
app.use('/lostpets', lostPetRoutes);
app.use('/matches',  matchRoutes);
app.use(express.static(path.join(__dirname, 'Admin_Dashboard')));

// ─── 4) HOME ROUTE ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🐾 Pawsibilities Backend API is running!');
});

// ─── 5) ERROR HANDLER ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});
