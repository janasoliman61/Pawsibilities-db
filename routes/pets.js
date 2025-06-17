// routes/pets.js
const express = require('express');
const router = express.Router();
const petsCtrl = require('../controllers/petsController');
const auth = require("../middleware/auth");
//(below existing routes)
const matchCtrl = require('../controllers/matchController');
router.post('/:petId/like/:targetId', matchCtrl.likePet);


// register, CRUD
router.post('/petregister', auth, petsCtrl.petregister);
router.get('/', petsCtrl.getAllPets);
router.get('/:petId', petsCtrl.getPet);
router.put('/:petId', petsCtrl.petUpdate);
router.delete('/:petId', petsCtrl.deletepet);
router.put('/:petId/status', auth, petsCtrl.updatePetStatus);
router.get('/status/:status', petsCtrl.getPetsByStatus);

// ── New matchmaking route ────────────────────────────────────
router.get('/:petId/matches', petsCtrl.getMatches);

module.exports = router;
