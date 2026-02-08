const express = require('express');
const router = express.Router();
const {
    submitComplaint,
    getComplaints,
    getWardComplaints,
    updateComplaintStatus,
    uploadComplaintImage,
    upload
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Image upload route
router.post('/upload', protect, upload.single('image'), uploadComplaintImage);

// Get all complaints in user's ward (for feed)
router.get('/ward', protect, getWardComplaints);

router.route('/')
    .post(protect, submitComplaint)
    .get(protect, getComplaints);

router.route('/:id')
    .put(protect, authorize('ward_member', 'admin'), updateComplaintStatus);

module.exports = router;
