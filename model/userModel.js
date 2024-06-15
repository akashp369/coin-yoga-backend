const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    dob: {
        type: String,
        trim: true,
    },
    isVerify: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user',
        trim: true,
        lowercase: true
    },
    otp: {
        type: Number,
        trim: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
