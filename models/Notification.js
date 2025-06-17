// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // The user receiving the notification
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The user who performed the action (e.g. posted the lost or found pet)
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification types; added `lost_found_match` for the new case
  type: {
    type: String,
    enum: ['match', 'lost_found_match', 'message', 'like'],
    required: true
  },

  // Human‐readable title & body
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },

  // References to the two pets when a lost/found match occurs
  petLost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  petFound: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },

  // Any extra metadata you might need
  data: {
    type: Object,
    default: {}
  },

  read: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
