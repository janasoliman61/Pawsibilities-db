const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth'); // optional if you want auth

// POST /matches/:petId/like/:targetId → create a match if both pets liked each other
router.post('/:petId/like/:targetId', matchController.likePet);


// (Optional) GET /matches/:petId → get confirmed matches for a pet
// router.get('/:petId', matchController.getMatches); ← implement later if needed

module.exports = router;