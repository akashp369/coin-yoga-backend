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
    username: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        // unique: true,
        trim: true,
        lowercase: true
    },
    profilePicture: {
        type: String,
    },
    coverPhoto: {
        type: String,
    },
    country:{
        type:String,
    },
    countryCode:{
        type:Number
    },
    gender: {
        type: String,
        trim: true,
        lowercase: true
    },
    dob: {
        type: Date,
    },
    mobile: {
        type: String,
        trim: true,
    },
    contactInformation: {
        address: {
            streetAddress: { type: String, trim: true },
            city: { type: String, trim: true },
            stateProvinceRegion: { type: String, trim: true },
            postalZipCode: { type: String, trim: true },
            country: { type: String, trim: true },
        },
        secondaryEmail: { type: String, trim: true, lowercase: true },
        secondaryPhoneNumber: { type: String, trim: true },
    },
    professionalInformation: {
        jobTitle: { type: String, trim: true },
        companyName: { type: String, trim: true },
        industry: { type: String, trim: true },
        workExperience: [{
            jobTitle: { type: String, trim: true },
            companyName: { type: String, trim: true },
            duration: { type: String, trim: true },
            responsibilities: { type: String, trim: true }
        }],
        languagesSpoken: [{ type: String, trim: true }],
    },
    educationalInformation: {
        highestDegreeObtained: { type: String, trim: true },
        universityCollegeName: { type: String, trim: true },
        fieldOfStudy: { type: String, trim: true },
        graduationYear: { type: Number },
        additionalCoursesCertifications: [{ type: String, trim: true }]
    },
    socialMediaLinks: {
        linkedInProfile: { type: String, trim: true },
        twitterHandle: { type: String, trim: true },
        facebookProfile: { type: String, trim: true },
        instagramHandle: { type: String, trim: true },
        personalWebsiteBlog: { type: String, trim: true }
    },
    personalInterestsHobbies: {
        hobbies: [{ type: String, trim: true }],
        favoriteBooks: [{ type: String, trim: true }],
        favoriteMovies: [{ type: String, trim: true }],
        favoriteMusic: [{ type: String, trim: true }],
        sportsActivities: [{ type: String, trim: true }]
    },
    preferences: {
        preferredLanguage: { type: String, trim: true },
        timeZone: { type: String, trim: true },
        privacySettings: {
            publicProfile: { type: Boolean, default: true },
            privateProfile: { type: Boolean, default: false },
            customSettings: { type: Map, of: String }
        }
    },
    emergencyContactInformation: {
        emergencyContactName: { type: String, trim: true },
        relationship: { type: String, trim: true },
        emergencyContactPhoneNumber: { type: String, trim: true },
        emergencyContactEmail: { type: String, trim: true, lowercase: true }
    },
    otherDetails: {
        biographyAboutMe: { type: String, trim: true },
        mottoOrQuote: { type: String, trim: true },
        achievements: [{ type: String, trim: true }],
        volunteerExperience: [{ type: String, trim: true }],
        membershipInOrganizations: [{ type: String, trim: true }],
        favoriteQuotes: [{ type: String, trim: true }]
    },
    customFields: {
        customField1: { type: String, trim: true },
        customField2: { type: String, trim: true }
    },
    password: {
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
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
