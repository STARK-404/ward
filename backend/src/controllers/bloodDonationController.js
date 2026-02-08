const BloodDonor = require('../models/BloodDonor');
const Emergency = require('../models/Emergency');
const User = require('../models/User');
const { sendPushNotifications } = require('../services/notificationService');

// Blood compatibility chart - who can receive from whom
const bloodCompatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'], // Universal donor
};

// @desc    Register as a blood donor
// @route   POST /api/blood-donation/register
// @access  Private
const registerDonor = async (req, res) => {
    const { bloodGroup, contactNumber } = req.body;
    const userId = req.user._id;

    try {
        // Check if already registered
        let donor = await BloodDonor.findOne({ user: userId });

        if (donor) {
            // Update existing registration
            donor.bloodGroup = bloodGroup || donor.bloodGroup;
            donor.contactNumber = contactNumber || donor.contactNumber;
            donor.ward = req.user.ward;
            donor.district = req.user.district;
            donor.state = req.user.state;
            await donor.save();
            return res.json({ message: 'Donor registration updated', donor });
        }

        // Create new donor registration
        donor = await BloodDonor.create({
            user: userId,
            bloodGroup,
            contactNumber,
            ward: req.user.ward,
            district: req.user.district,
            state: req.user.state,
        });

        res.status(201).json({ message: 'Successfully registered as blood donor', donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update donor availability
// @route   PUT /api/blood-donation/availability
// @access  Private
const updateDonorAvailability = async (req, res) => {
    const { isAvailable } = req.body;
    const userId = req.user._id;

    try {
        const donor = await BloodDonor.findOne({ user: userId });

        if (!donor) {
            return res.status(404).json({ message: 'You are not registered as a donor' });
        }

        donor.isAvailable = isAvailable;
        await donor.save();

        res.json({ message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`, donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get donor status for current user
// @route   GET /api/blood-donation/my-status
// @access  Private
const getMyDonorStatus = async (req, res) => {
    try {
        const donor = await BloodDonor.findOne({ user: req.user._id });

        if (!donor) {
            return res.json({ isRegistered: false });
        }

        res.json({ isRegistered: true, donor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available donors in ward
// @route   GET /api/blood-donation/donors
// @access  Private
const getDonors = async (req, res) => {
    const { ward, bloodGroup } = req.query;

    try {
        let query = { isAvailable: true };

        if (ward) query.ward = ward;
        if (bloodGroup) query.bloodGroup = bloodGroup;

        const donors = await BloodDonor.find(query)
            .populate('user', 'name phone')
            .sort({ createdAt: -1 });

        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request blood donation - sends emergency notifications to matching donors
// @route   POST /api/blood-donation/request
// @access  Private
const requestBloodDonation = async (req, res) => {
    const { bloodGroup, location, contactNumber, urgency, details } = req.body;
    const userId = req.user._id;

    try {
        // Create emergency record
        const emergency = await Emergency.create({
            requester: userId,
            type: 'blood',
            details: `Blood Group: ${bloodGroup}. ${details || ''} Urgency: ${urgency || 'normal'}`,
            ward: req.user.ward,
            location,
            contactNumber,
        });

        // Find ALL users in the same ward (excluding the requester) with push tokens
        const wardUsers = await User.find({
            ward: { $regex: new RegExp(`^${req.user.ward.trim()}$`, 'i') },
            _id: { $ne: userId },
            expoPushToken: { $exists: true, $ne: null }
        }).select('expoPushToken name');

        // Collect push tokens from all ward members
        const pushTokens = wardUsers.map(user => user.expoPushToken);

        // Send push notifications to all ward members
        if (pushTokens.length > 0) {
            await sendPushNotifications(pushTokens, {
                title: '🩸 Emergency Blood Request!',
                body: `Urgent: ${bloodGroup} blood needed in ${req.user.ward}. Tap to respond.`,
                data: {
                    type: 'blood_request',
                    emergencyId: emergency._id.toString(),
                    bloodGroup,
                    location,
                    contactNumber,
                },
            });
        }

        res.status(201).json({
            message: 'Blood request submitted',
            emergency,
            notifiedUsers: wardUsers.length,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Mark donation complete (updates last donation date)
// @route   PUT /api/blood-donation/complete
// @access  Private
const markDonationComplete = async (req, res) => {
    try {
        const donor = await BloodDonor.findOne({ user: req.user._id });

        if (!donor) {
            return res.status(404).json({ message: 'You are not registered as a donor' });
        }

        donor.lastDonationDate = new Date();
        donor.isAvailable = false; // Typically donors need to wait before donating again
        await donor.save();

        res.json({ message: 'Donation marked as complete. You have been set to unavailable.', donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    registerDonor,
    updateDonorAvailability,
    getMyDonorStatus,
    getDonors,
    requestBloodDonation,
    markDonationComplete,
};
