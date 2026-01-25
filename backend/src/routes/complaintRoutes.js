const express = require('express');
const router = express.Router();
const { submitComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, submitComplaint)
    .get(protect, getComplaints);

router.route('/:id')
    .put(protect, authorize('ward_member', 'admin'), updateComplaintStatus);

module.exports = router;
