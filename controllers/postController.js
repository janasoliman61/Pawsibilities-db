// controllers/postController.js

const Post = require('../models/Post')

// ─── Create a new post ───────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { description, media, tags, location } = req.body
    const author = req.user._id

    const post = await Post.create({
      author,
      description,
      media,     // e.g. [{ url, filename, contentType }]
      tags,      // e.g. ['labrador', 'puppy']
      location   // e.g. { type: 'Point', coordinates: [long, lat] }
    })

    res.status(201).json(post)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Get feed (paginated, most-recent first) ─────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { cursor, limit = 20 } = req.query
    const query = { isDeleted: false }
    if (cursor) query.createdAt = { $lt: new Date(cursor) }

    // Fetch one extra to see if there’s more
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('author', 'username avatar')

    let nextCursor = null
    if (posts.length > limit) {
      nextCursor = posts[limit].createdAt.toISOString()
      posts.pop()
    }

    res.json({ posts, nextCursor })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Get a single post by ID ─────────────────────────────────────────────────
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('comments')   // if you have a Comment model
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json(post)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Update / delete ─────────────────────────────────────────────────────────
exports.updatePost = async (req, res) => {
  try {
    const updates = (({ description, media, tags }) => ({ description, media, tags }))(req.body)
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      updates,
      { new: true, runValidators: true }
    )
    if (!post) return res.status(404).json({ message: 'Not found or not yours' })
    res.json(post)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { isDeleted: true },
      { new: true }
    )
    if (!post) return res.status(404).json({ message: 'Not found or not yours' })
    res.json({ message: 'Post removed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Like / Unlike ────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user._id
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const alreadyLiked = post.likes.includes(userId)
    if (alreadyLiked) {
      post.likes.pull(userId)
      post.likeCount--
    } else {
      post.likes.push(userId)
      post.likeCount++
    }
    await post.save()

    res.json({ likeCount: post.likeCount, liked: !alreadyLiked })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}
