const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { addComment, getComments } = require('../controllers/commentsController')

router.post('/', auth, addComment)
router.get('/:postId', auth, getComments)

module.exports = router
