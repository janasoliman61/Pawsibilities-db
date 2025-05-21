const Comment = require('../models/Comments')
const Post = require('../models/Post')

// Add a comment
exports.addComment = async (req, res) => {
  const { postId, text } = req.body
  const author = req.user._id

  const comment = await Comment.create({ post: postId, author, text })
  // push its ID into the post
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } })

  res.status(201).json(comment)
}

// List comments for a post (with pagination)
exports.getComments = async (req, res) => {
  const { postId } = req.params
  const { page = 1, limit = 20 } = req.query

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip((page-1)*limit)
    .limit(parseInt(limit))
    .populate('author', 'username avatar')

  res.json(comments)
}
