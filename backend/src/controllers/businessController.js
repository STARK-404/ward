const Business = require('../models/Business');
const multer = require('multer');
const path = require('path');

// Multer Storage config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
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

// @desc    Register a business
// @route   POST /api/businesses
// @access  Private (Citizen/Business Role/Admin)
const registerBusiness = async (req, res) => {
    const { name, description, category, contactNumber, ward, address, imageUrl } = req.body;

    try {
        const business = await Business.create({
            owner: req.user._id,
            name,
            description,
            category,
            contactNumber,
            ward,
            address,
            imageUrl,
            status: req.user.role === 'admin' ? 'active' : 'pending'
        });
        res.status(201).json(business);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all businesses in a ward
// @route   GET /api/businesses?ward=Ward1
// @access  Public
const getBusinesses = async (req, res) => {
    const { ward, status } = req.query;
    try {
        let query = {};
        if (ward) {
            query.ward = { $regex: new RegExp(`^${ward.trim()}$`, 'i') };
        }

        // Default to active status if not specified (e.g., for public directory)
        // If admin specifies status, we use that. If admin doesn't specify status, show all.
        if (req.user && req.user.role === 'admin') {
            if (status) {
                query.status = status;
            }
            // If no status specified, admin sees all (don't set query.status)
        } else {
            query.status = 'active';
        }

        const businesses = await Business.find(query).populate('owner', 'name');
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my businesses
// @route   GET /api/businesses/my
// @access  Private
const getMyBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ owner: req.user._id });
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a business
// @route   PUT /api/businesses/:id
// @access  Private (Owner/Admin)
const updateBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // Check verification: Owner or Admin
        if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this business' });
        }

        business.name = req.body.name || business.name;
        business.description = req.body.description || business.description;
        business.category = req.body.category || business.category;
        business.contactNumber = req.body.contactNumber || business.contactNumber;
        business.ward = req.body.ward || business.ward;
        business.address = req.body.address || business.address;

        // Admin specific: approve/reject status
        if (req.user.role === 'admin' && req.body.status) {
            business.status = req.body.status;
        }

        const updatedBusiness = await business.save();
        res.json(updatedBusiness);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerBusiness, getBusinesses, getMyBusinesses, updateBusiness, upload };
