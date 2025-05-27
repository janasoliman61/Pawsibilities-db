const mongoose = require('mongoose')
const { Schema, Types } = mongoose

const reportSchema = new Schema({
  post: {
    type: Types.ObjectId,
    ref: 'Post',
    required: true
  },
  reporter: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'admitted', 'dismissed'],
    default: 'pending'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Report', reportSchema)