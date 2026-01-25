const express = require('express');
const router = express.Router();
const { reportEmergency, getEmergencies } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, reportEmergency)
    .get(getEmergencies);

module.exports = router;
