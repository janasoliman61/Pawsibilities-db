const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const lostPetController = require('../controllers/lostPetController');

router.post('/report', auth, lostPetController.reportLostPet);
router.get('/lost', lostPetController.getLostReports);
router.get('/found', lostPetController.getFoundReports);

module.exports = router;