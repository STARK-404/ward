const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    category: String,
    contactNumber: String,
    ward: { type: String, required: true },
    address: String,
    imageUrl: String,
    status: { type: String, enum: ['active', 'pending', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema);
