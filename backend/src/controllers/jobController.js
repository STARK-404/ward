const Job = require('../models/Job');

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Business/Admin)
const postJob = async (req, res) => {
    const { title, description, skillsRequired, salaryRange, type, ward } = req.body;

    try {
        const job = await Job.create({
            business: req.body.businessId, // Ideally associated with a business owned by user
            title,
            description,
            skillsRequired,
            salaryRange,
            type,
            ward
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get jobs (filter by ward)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    const { ward } = req.query;
    try {
        let query = { isActive: true };
        if (ward) {
            query.ward = ward;
        }
        const jobs = await Job.find(query).populate('business', 'name');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { postJob, getJobs };
