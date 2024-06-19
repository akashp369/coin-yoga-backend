const asyncHandler = require("express-async-handler")
const response = require("../middleware/responseMiddlewares")
const AdminDB = require("../model/adminModel")
const AdminSettings = require("../model/adminSettingsModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await AdminDB.findOne({ email });
    if (adminExists) {
        return response.validationError(res, "Admin already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await AdminDB.create({
        name,
        email,
        password: hashedPassword,
    });

    response.successResponse(res, admin, "Admin created successfully");
});

// Admin Login
module.exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await AdminDB.findOne({ email });
    if (!admin) {
        return response.validationError(res, "Admin not found");
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return response.validationError(res, "Invalid credentials");
    }

    // Generate token
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set token in cookie
    res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: 'None', // or 'strict'
        maxAge: 24 * 60 * 60 * 1000
    });

    response.successResponse(res, { token }, "Admin logged in successfully");
});



module.exports.updateAdminSettings = asyncHandler(async (req, res) => {
    try {
        const { maxWishlistsPerUser, maxItemsPerWishlist } = req.body;
        if (!maxWishlistsPerUser || !maxItemsPerWishlist) {
            return response.validationError(res, "All Field Required.")
        }
        let settings = await AdminSettings.findOne();
        if (!settings) {
            settings = new AdminSettings();
        }
        settings.maxWishlistsPerUser = maxWishlistsPerUser;
        settings.maxItemsPerWishlist = maxItemsPerWishlist;
        await settings.save();

        response.successResponse(res, settings, "Admin settings updated successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


