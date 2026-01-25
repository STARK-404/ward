const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, updateUserById, getUsers, registerPushToken } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin'), getUsers);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/push-token')
    .post(protect, registerPushToken);

router.route('/:id')
    .put(protect, authorize('admin'), updateUserById);

module.exports = router;
