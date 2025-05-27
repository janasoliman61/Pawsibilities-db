// controllers/postController.js

const Post = require('../models/Post')
const Comment = require('../models/Comment')
const { sendNotification } = require('../services/notificationService')

exports.createPost = async (req, res) => {
  try {
    const { description, media, tags, location } = req.body
    // you can add validation here
    const post = new Post({ description, media, tags, location, author: req.user._id })
    await post.save()
    res.status(201).json(post)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}
// Toggle like on a post, and notify the author when a new like is added
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user._id
    const post   = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const alreadyLiked = post.likes.includes(userId)
    if (alreadyLiked) {
      post.likes.pull(userId)
      post.likeCount = Math.max(0, (post.likeCount || 1) - 1)
    } else {
      post.likes.push(userId)
      post.likeCount = (post.likeCount || 0) + 1

      // → send push when adding a like
      await sendNotification({
        toUserId: post.author,
        type:     'like',
        title:    '❤️ Someone liked your post!',
        body:     `${req.user.username} liked your post.`,
        data:     { postId: post._id.toString() }
      })
    }

    await post.save()
    res.json({ likeCount: post.likeCount, liked: !alreadyLiked })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}