// routes/pets.js
const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController');

router.post('/petregister',petsController.petregister);
router.get('/pets', petsController.getAllPets);
router.get('/pets:petID', petsController.getPet);
router.put('/pets:petID', petsController.petUpdate);
router.delete('/pets:petID', petsController.deletepet);


module.exports = router;