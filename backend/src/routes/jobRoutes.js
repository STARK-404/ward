const express = require('express');
const router = express.Router();
const { postJob, getJobs } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('business', 'admin'), postJob)
    .get(getJobs);

module.exports = router;
