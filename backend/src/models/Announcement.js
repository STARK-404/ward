const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Must be Ward Member or Admin
    title: { type: String, required: true },
    content: { type: String, required: true },
    ward: { type: String, required: true },
    priority: { type: String, enum: ['normal', 'high', 'emergency'], default: 'normal' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
