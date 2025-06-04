// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  to:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['match','message','like'], required: true },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  data:    { type: Object },        // any extra payload
  read:    { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
