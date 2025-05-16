const express = require('express')
const postController = require('../controllers/postController')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, postController.createPost)
router.get('/', auth, postController.getFeed)
router.get('/:id', auth, postController.getPostById)
router.patch('/:id', auth, postController.updatePost)
router.delete('/:id', auth, postController.deletePost)
router.post('/:id/like', auth, postController.toggleLike)

module.exports = router;
