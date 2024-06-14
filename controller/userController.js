const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler")
const response = require("../middleware/responseMiddlewares")
const userDB = require("../model/userModel")
const { generateOtp } = require("../utils/helper")
const { towfectorsendOtp } = require("../utils/2factor")

// Create User with Mobile and OTP
module.exports.createUser = asyncHandler(async (req, res) => {
    try {
        const { mobile } = req.body;

        // Check if user already exists with the same mobile number
        let user = await userDB.findOne({ mobile });

        if (user) {
            if (user.isVerify) {
                return response.validationError(res, "User already exists with this mobile number and is verified");
            } else {
                // Delete the existing unverified user
                await userDB.deleteOne({ _id: user._id });
            }
        }

        // Generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const sendotp = await towfectorsendOtp(mobile, otp);
        if (!sendotp) {
            return response.internalServerError(res, "Error while send the otp.")
        }

        // Create new user with OTP
        user = await userDB.create({
            mobile,
            otp,
            isVerify: false
        });

        response.successResponse(res, user, "User created successfully, OTP sent");
    } catch (error) {
        response.internalServerError(res, error.message)
    }
});

// Verify User OTP
module.exports.verifyUser = asyncHandler(async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        // Check if user exists
        const user = await userDB.findOne({ mobile });
        if (!user) {
            return response.validationError(res, "User not found");
        }

        // Verify OTP
        if (user.otp !== otp) {
            return response.validationError(res, "Invalid OTP");
        }

        // Update user as verified
        user.isVerify = true;
        user.otp = null;
        await user.save();

        response.successResponse(res, user, "User verified successfully");
    } catch (error) {
        response.internalServerError(res, error.message)
    }
});

// Login User and Send OTP
module.exports.loginUser = asyncHandler(async (req, res) => {
    try {
        const { mobile } = req.body;

        // Check if user exists
        const user = await userDB.findOne({ mobile, isVerify: true });
        if (!user) {
            return response.validationError(res, "User not found or not verify Account");
        }

        // Generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const sendotp = await towfectorsendOtp(mobile, otp);
        if (!sendotp) {
            return response.internalServerError(res, "Error while send the otp.")
        }

        // Update user with the new OTP
        user.otp = otp;
        await user.save();

        response.successResponse(res, { mobile }, "OTP sent to mobile number");
    } catch (error) {
        response.internalServerError(res, error.message)
    }
});

// Verify Login OTP
module.exports.verifyLoginOtp = asyncHandler(async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        // Check if user exists
        const user = await userDB.findOne({ mobile });
        if (!user) {
            return response.validationError(res, "User not found");
        }

        // Verify OTP
        if (user.otp !== otp) {
            return response.validationError(res, "Invalid OTP");
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set token in cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Clear OTP after successful verification
        user.otp = null;
        await user.save();

        response.successResponse(res, { token }, "User logged in successfully");
    } catch (error) {
        response.internalServerError(res, error.message)
    }
});