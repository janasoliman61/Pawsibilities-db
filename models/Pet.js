const mongoose = require('mongoose');

// Allowed traits
const ALLOWED_TRAITS = [
  'playfull', 'sociable', 'shy', 'calm', 'agressive',
  'curiouse', 'excited', 'anxtious', 'fearfull',
  'hyperactive', 'lazy'
];

// Trait validator
function arrayLimit(val) {
  return val.length <= 4;
}

// Optional: allow max 3 photos in future
function arrayLimitPhotos(val) {
  return val.length <= 3;
}

const petSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  OwnerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Age: { type: Number },
  gender: { type: String },
  vaccinationStatus: { type: Boolean },
  Photo: { type: String },

  personalityTraits: {
    type: [String],
    enum: {
      values: ALLOWED_TRAITS,
      message: '`{VALUE}` is not a valid personality trait'
    },
    validate: [arrayLimit, 'A pet can have at most 4 personality traits'],
    default: []
  },

  weight: { type: Number },
  breed: { type: String },
  status: { type: String, enum: ['adoption', 'mating', 'none'], default: 'none' },

  // 🧭 location inherited from user
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },

  preferences: {
    maxDistanceKm: { type: Number, default: 50 },
    preferredBreeds: { type: [String], default: [] },
    preferredAgeRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 }
    },
    preferredSize: { type: String, enum: ['Small', 'Medium', 'Large'], default: null },
    preferredGender: { type: String, enum: ['Male', 'Female'], default: null }
  }
}, {
  timestamps: true
});

petSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pet', petSchema);
module.exports.ALLOWED_TRAITS = ALLOWED_TRAITS;
