const mongoose = require('mongoose');

const lostPetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  photoUrl: { type: String, required: true },
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  timeReported: { type: Date, default: Date.now },
  breed: String
});

module.exports = mongoose.model('LostPet', lostPetSchema);