// models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  petA: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  petB: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  matchedAt: { type: Date, default: Date.now }
});

// prevent dupes (A–B same as B–A)
matchSchema.index({ petA: 1, petB: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
