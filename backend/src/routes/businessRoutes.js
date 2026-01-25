const express = require('express');
const router = express.Router();
const { registerBusiness, getBusinesses, getMyBusinesses, updateBusiness, upload } = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('citizen', 'business', 'admin'), registerBusiness)
    .get(protect, getBusinesses);

router.route('/my').get(protect, getMyBusinesses);

router.post('/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    res.send({
        message: 'Image uploaded',
        imageUrl: `/uploads/${req.file.filename}`
    });
});

router.route('/:id')
    .put(protect, authorize('business', 'admin'), updateBusiness);

module.exports = router;
