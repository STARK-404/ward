const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendPushNotifications } = require('../services/notificationService');
const multer = require('multer');
const path = require('path');

// Multer Storage config for complaint images
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `complaint-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Images only!');
        }
    }
});

// @desc    Upload complaint image
// @route   POST /api/complaints/upload
// @access  Private
const uploadComplaintImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
};

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private
const submitComplaint = async (req, res) => {
    const { title, description, ward, imageUrl } = req.body;

    try {
        const complaint = await Complaint.create({
            user: req.user._id,
            title,
            description,
            ward: ward.trim(),
            imageUrl
        });

        // Send push notifications to all users in this ward
        try {
            const wardUsers = await User.find({
                ward: { $regex: new RegExp(`^${ward.trim()}$`, 'i') },
                expoPushToken: { $exists: true, $ne: null }
            }).select('expoPushToken');

            const pushTokens = wardUsers.map(u => u.expoPushToken).filter(Boolean);

            if (pushTokens.length > 0) {
                await sendPushNotifications(pushTokens, {
                    title: `🚨 New Issue Reported`,
                    body: `${title}: ${description.substring(0, 80)}${description.length > 80 ? '...' : ''}`,
                    data: { complaintId: complaint._id, ward, type: 'new_complaint' }
                });
                console.log(`Sent complaint notifications to ${pushTokens.length} users in ward ${ward}`);
            }
        } catch (notifError) {
            console.error('Error sending complaint notifications:', notifError);
            // Don't fail the complaint creation if notifications fail
        }

        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get complaints (Ward Member sees all in ward, citizen sees own)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'ward_member' || req.user.role === 'admin') {
            query.ward = req.user.ward;
        } else {
            query.user = req.user._id;
        }

        const complaints = await Complaint.find(query)
            .populate('user', 'name phone')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints in the user's ward (for feed)
// @route   GET /api/complaints/ward
// @access  Private
const getWardComplaints = async (req, res) => {
    try {
        const ward = req.user.ward;
        const complaints = await Complaint.find({
            ward: { $regex: new RegExp(`^${ward.trim()}$`, 'i') }
        })
            .populate('user', 'name phone')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Ward Member/Admin)
const updateComplaintStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Logic check: only ward member of THAT ward can update
        if (complaint.ward !== req.user.ward && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update complaints in this ward' });
        }

        const previousStatus = complaint.status;
        complaint.status = req.body.status || complaint.status;

        // Track resolution details
        if (req.body.status === 'resolved' && previousStatus !== 'resolved') {
            complaint.resolvedAt = new Date();
            complaint.resolvedBy = req.user._id;

            // Send notification that complaint is resolved
            try {
                const wardUsers = await User.find({
                    ward: { $regex: new RegExp(`^${complaint.ward.trim()}$`, 'i') },
                    expoPushToken: { $exists: true, $ne: null }
                }).select('expoPushToken');

                const pushTokens = wardUsers.map(u => u.expoPushToken).filter(Boolean);

                if (pushTokens.length > 0) {
                    await sendPushNotifications(pushTokens, {
                        title: `✅ Issue Resolved`,
                        body: `${complaint.title} has been resolved!`,
                        data: { complaintId: complaint._id, ward: complaint.ward, type: 'complaint_resolved' }
                    });
                    console.log(`Sent resolved notifications to ${pushTokens.length} users`);
                }
            } catch (notifError) {
                console.error('Error sending resolved notifications:', notifError);
            }
        }

        await complaint.save();

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitComplaint,
    getComplaints,
    getWardComplaints,
    updateComplaintStatus,
    uploadComplaintImage,
    upload
};
