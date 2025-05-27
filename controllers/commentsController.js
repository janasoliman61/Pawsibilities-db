// controllers/commentsController.js
const Post    = require('../models/Post')
const Comment = require('../models/Comment')
const { sendNotification } = require('../services/notificationService')

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body
    const postId   = req.params.id

    if (!text) return res.status(400).json({ message: 'Comment text is required' })

    // 1) create and attach
    const comment = await Comment.create({
      post:   postId,
      author: req.user._id,
      text
    })
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
      $inc:  { commentCount: 1 }
    })

    // 2) notify
    try {
      await sendNotification({
        toUserId: post.author,
        type:     'comment',
        title:    '💬 New comment on your post',
        body:     `${req.user.userName}: "${text.substring(0, 50)}"`,
        data:     { postId, commentId: comment._id.toString() }
      })
    } catch (e) {
      console.error('Push failed:', e)
    }

    res.status(201).json({ comment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

exports.getComments = async (req, res) => {
  const comments = await Comment
    .find({ post: req.params.id })
    .sort('-createdAt')
    .populate('author', 'userName avatar')
  res.json(comments)
}
