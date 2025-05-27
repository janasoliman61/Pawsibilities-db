// routes/posts.js
const express            = require('express')
const router             = express.Router()
const auth               = require('../middleware/auth')
const postController     = require('../controllers/postController')
const reportController   = require('../controllers/reportController')


// Like / Unlike
router.post('/:id/like',      auth, postController.toggleLike)
router.post('/:id/report', auth, reportController.createReport)
router.post('/', auth, postController.createPost)

module.exports = router;
