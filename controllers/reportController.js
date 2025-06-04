const Report = require('../models/Report')
const Post   = require('../models/Post')

// 1) Submit a new report on a post
exports.createReport = async (req, res) => {
  try {
    const { description } = req.body
    if (!description) return res.status(400).json({ message: 'Description is required' })

    const postId = req.params.id
    // prevent duplicate reports by same user
    const already = await Report.findOne({ post: postId, reporter: req.user._id })
    if (already) return res.status(400).json({ message: 'You already reported this post' })

    const report = new Report({
      post:        postId,
      reporter:    req.user._id,
      description  // new field
    })
    await report.save()
    return res.status(201).json({ message: 'Report submitted' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// 2) Admin: list all pending reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report
      .find({ status: 'pending' })
      .populate('post', 'description author')
      .populate('reporter', 'username')
      .sort({ createdAt: -1 })

    return res.json(reports)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// 3) Admin: admit a report (and mark post deleted)
exports.admitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })
    report.status = 'admitted'
    await report.save()
    // optional: flag the post
    await Post.findByIdAndUpdate(report.post, { isDeleted: true })
    return res.json({ message: 'Report admitted' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// 4) Admin: dismiss a report
exports.dismissReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })
    report.status = 'dismissed'
    await report.save()
    return res.json({ message: 'Report dismissed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}