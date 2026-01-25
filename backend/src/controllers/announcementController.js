const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { sendPushNotifications } = require('../services/notificationService');

// @desc    Post announcement
// @route   POST /api/announcements
// @access  Private (Ward Member/Admin)
const postAnnouncement = async (req, res) => {
    const { title, content, ward, priority } = req.body;

    try {
        const announcement = await Announcement.create({
            postedBy: req.user._id,
            title,
            content,
            ward: ward.trim(),
            priority
        });

        // Send push notifications to users in this ward
        try {
            const wardUsers = await User.find({
                ward: { $regex: new RegExp(`^${ward.trim()}$`, 'i') },
                expoPushToken: { $exists: true, $ne: null }
            }).select('expoPushToken');

            const pushTokens = wardUsers.map(u => u.expoPushToken).filter(Boolean);

            if (pushTokens.length > 0) {
                await sendPushNotifications(pushTokens, {
                    title: `📢 ${title}`,
                    body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    data: { announcementId: announcement._id, ward }
                });
                console.log(`Sent notifications to ${pushTokens.length} users in ward ${ward}`);
            }
        } catch (notifError) {
            console.error('Error sending notifications:', notifError);
            // Don't fail the announcement creation if notifications fail
        }

        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get announcements for a ward
// @route   GET /api/announcements?ward=Ward1
// @access  Public
const getAnnouncements = async (req, res) => {
    const { ward } = req.query;
    try {
        let query = {};
        if (ward) {
            query.ward = { $regex: new RegExp(`^${ward.trim()}$`, 'i') };
        }
        const announcements = await Announcement.find(query).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { postAnnouncement, getAnnouncements };
