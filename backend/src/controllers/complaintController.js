const Complaint = require('../models/Complaint');

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private
const submitComplaint = async (req, res) => {
    const { title, description, ward } = req.body;

    try {
        const complaint = await Complaint.create({
            user: req.user._id,
            title,
            description,
            ward
        });
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

        complaint.status = req.body.status || complaint.status;
        await complaint.save();

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitComplaint, getComplaints, updateComplaintStatus };
