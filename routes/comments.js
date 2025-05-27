const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const commentsController = require('../controllers/commentsController')

router.post('/:id', auth, commentsController.addComment)
router.get('/:postId', auth, commentsController.getComments)

module.exports = router;
