const Emergency = require('../models/Emergency');

// @desc    Request emergency help (Blood/SOS)
// @route   POST /api/emergency
// @access  Private
const reportEmergency = async (req, res) => {
    const { type, details, ward, location, contactNumber } = req.body;

    try {
        const emergency = await Emergency.create({
            requester: req.user._id,
            type,
            details,
            ward,
            location,
            contactNumber
        });
        // In a real app, trigger push notifications here using FCM
        res.status(201).json(emergency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get active emergencies in ward
// @route   GET /api/emergency
// @access  Public
const getEmergencies = async (req, res) => {
    const { ward } = req.query;
    try {
        let query = { isActive: true };
        if (ward) {
            query.ward = ward;
        }
        const emergencies = await Emergency.find(query).sort({ createdAt: -1 });
        res.json(emergencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { reportEmergency, getEmergencies };
