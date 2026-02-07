const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    isAvailable: { type: Boolean, default: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    lastDonationDate: { type: Date },
    contactNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
bloodDonorSchema.pre('save', function () {
    this.updatedAt = new Date();
});

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
