const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const rptCtrl = require('../controllers/reportController')

// GET all pending reports
router.get('/', rptCtrl.getReports)

// POST admit/dismiss
router.post('/:id/admit', auth, rptCtrl.admitReport)
router.post('/:id/dismiss', auth, rptCtrl.dismissReport)

module.exports = router