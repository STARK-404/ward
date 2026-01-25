const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password (or OTP equivalent secret)
    role: {
        type: String,
        enum: ['citizen', 'business', 'ward_member', 'admin'],
        default: 'citizen'
    },
    ward: { type: String, required: true }, // Ward ID or Name
    district: { type: String, required: true },
    state: { type: String, required: true },
    profile: {
        age: Number,
        gender: String,
        bloodGroup: String,
        skills: [String],
        education: String,
        qualification: String,
        employmentStatus: String,
    },
    isVerified: { type: Boolean, default: false },
    expoPushToken: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hash
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
