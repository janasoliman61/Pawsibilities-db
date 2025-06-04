const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  breed: { type: String, required: true },
  confidence: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  context: { type: String } // e.g. "lost_pet", "registration", etc.
});

module.exports = mongoose.model('Prediction', PredictionSchema);