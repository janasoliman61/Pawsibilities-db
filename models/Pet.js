// models/Pet.js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    petId: {type: Number},
    Name: { type: String, required: true },
    OwnerID: {type: Number,unique: true,},
    Age: {type: Number},
    color:  { type: String, required: true}, 
    gender: { type: String },
    vaccinationStatus:  { type: Boolean},
    Photo:  { type: String },
    personalityStatus:  { type: String},
    adopted:  { type: Boolean},
    weight: {type: Number}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
