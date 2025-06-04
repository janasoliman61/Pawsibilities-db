// server.js
require('dotenv').config();      // ← loads your .env into process.env
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path    = require('path') 

const userRoutes    = require('./routes/users');
const petsRoutes    = require('./routes/pets');
const postRoutes    = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const lostPetRoutes  = require('./routes/lostPets'); // ✅ IMPORT HERE
const matchRoutes = require('./routes/matches'); 
const reportRoutes = require('./routes/reports')



const app = express();
const PORT = process.env.PORT || 5001;

// ─── 1) MIDDLEWARE ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());         // for parsing JSON bodies

// ─── 2) DB CONNECT ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── 3) ROUTES ──────────────────────────────────────────────────────────
app.use('/users',    userRoutes);
app.use('/pets',     petsRoutes);
app.use('/posts',    postRoutes);
app.use('/comments', commentRoutes);
app.use('/reports', reportRoutes)
app.use('/lostpets',  lostPetRoutes); // ✅ NEW: Lost & Found endpoint
app.use('/matches', matchRoutes);
app.use(express.static(path.join(__dirname, 'Admin_Dashboard')))

// ─── 4) HOME ROUTE ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🐾 Pawsibilities Backend API is running!');
});
app.use('/reports', reportRoutes)
app.use(express.static(path.join(__dirname, 'Admin_Dashboard')))

// ─── 4) ERROR HANDLER ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// ─── 5) START SERVER ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
