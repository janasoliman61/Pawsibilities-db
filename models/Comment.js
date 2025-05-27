const mongoose = require('mongoose')
const { Schema, Types } = mongoose

const commentSchema = new Schema({
  post: {
    type: Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true   // adds createdAt & updatedAt
})

module.exports = mongoose.model('Comment', commentSchema)
