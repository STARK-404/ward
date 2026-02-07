const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.ward = req.body.ward || user.ward;
        user.district = req.body.district || user.district;
        user.state = req.body.state || user.state;

        if (req.body.profile) {
            // Initialize profile if it doesn't exist
            const existingProfile = user.profile ? user.profile.toObject() : {};
            user.profile = { ...existingProfile, ...req.body.profile };
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            phone: updatedUser.phone,
            role: updatedUser.role,
            ward: updatedUser.ward,
            profile: updatedUser.profile
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update any user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.role = req.body.role || user.role;
            user.ward = req.body.ward || user.ward;

            // Admin can also verify users
            if (req.body.isVerified !== undefined) {
                user.isVerified = req.body.isVerified;
            }

            // Admin can edit other fields too
            user.phone = req.body.phone || user.phone;
            if (req.body.profile) {
                user.profile = { ...user.profile, ...req.body.profile };
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register push notification token
// @route   POST /api/users/push-token
// @access  Private
const registerPushToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Push token is required' });
    }

    try {
        await User.findByIdAndUpdate(req.user._id, { expoPushToken: token });
        res.json({ message: 'Push token registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, updateUserById, getUsers, registerPushToken };
