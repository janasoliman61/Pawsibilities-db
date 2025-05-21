const mongoose = require('mongoose')
const { Schema, Types } = mongoose

const postSchema = new Schema({
  author: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  media: [
    {
      url: String,
      filename: String,
      contentType: String
    }
  ],
  likes: [
    {
      type: Types.ObjectId,
      ref: 'User'
    }
  ],
  likeCount: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: Types.ObjectId,
      ref: 'Comment'
    }
  ],
  tags: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true    // adds createdAt & updatedAt
})

module.exports = mongoose.model('Post', postSchema)
