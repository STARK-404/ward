const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    title: { type: String, required: true },
    description: String,
    skillsRequired: [String],
    salaryRange: String,
    type: { type: String, enum: ['full-time', 'part-time', 'contract', 'daily-wage'], default: 'full-time' },
    ward: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
