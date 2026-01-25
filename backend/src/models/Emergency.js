const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['blood', 'medical', 'disaster', 'other'], required: true },
    details: String, // e.g., Blood Group A+
    ward: { type: String, required: true },
    location: String,
    contactNumber: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Emergency', emergencySchema);
