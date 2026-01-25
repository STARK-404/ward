const express = require('express');
const router = express.Router();
const { postAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('ward_member', 'admin'), postAnnouncement)
    .get(getAnnouncements);

module.exports = router;
