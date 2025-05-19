// models/Pet.js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  petId:    { type: Number },
  Name:     { type: String, required: true },
  OwnerID:  { type: Number, unique: true },
  Age:      { type: Number },
  color:    { type: String, required: true },
  gender:   { type: String },
  vaccinationStatus: { type: Boolean },
  Photo:    { type: String },
  personalityStatus: { type: String },
  weight:   { type: Number },

  // ── New fields for matchmaking ─────────────────────────────────────────────
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],      // [ longitude, latitude ]
      required: true
    }
  },
  preferences: {
    maxDistanceKm: { type: Number, default: 50 },
    preferredBreeds:   { type: [String], default: [] },
    preferredAgeRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 }
    },
    preferredSize:   { type: String, enum: ['Small','Medium','Large'], default: null },
    preferredGender: { type: String, enum: ['Male','Female'], default: null }
  }
}, {
  timestamps: true
});

// 2dsphere index for geo-queries
petSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pet', petSchema);
