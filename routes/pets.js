// routes/pets.js
const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController');
//(below existing routes)

router.post('/petregister',petsController.petregister);
router.get('/getallpets', petsController.getAllPets);
router.get('/pets/:petID', petsController.getPet);
router.put('/pets/:petID', petsController.petUpdate);
router.delete('/deletepet', petsController.deletepet);


// ── New matchmaking route ────────────────────────────────────
router.get('/:petId/matches', petsController.getMatches);

module.exports = router;
