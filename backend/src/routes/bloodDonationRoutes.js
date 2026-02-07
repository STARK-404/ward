const express = require('express');
const router = express.Router();
const {
    registerDonor,
    updateDonorAvailability,
    getMyDonorStatus,
    getDonors,
    requestBloodDonation,
    markDonationComplete,
} = require('../controllers/bloodDonationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.post('/register', registerDonor);
router.put('/availability', updateDonorAvailability);
router.get('/my-status', getMyDonorStatus);
router.get('/donors', getDonors);
router.post('/request', requestBloodDonation);
router.put('/complete', markDonationComplete);

module.exports = router;
