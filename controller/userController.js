const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler")
const response = require("../middleware/responseMiddlewares")
const userDB = require("../model/userModel")
const otpDB = require("../model/otpModel")
const { generateOtp } = require("../utils/helper")
const { towfectorsendOtp } = require("../utils/2factor");
const { uploadOnCloudinary } = require('../middleware/Cloudinary');
const { sendMailByNodemailer } = require("../utils/nodemailer")

const generateRandomNumber = () => Math.floor(10000 + Math.random() * 90000);

// Create User with Mobile and OTP
module.exports.createUser = asyncHandler(async (req, res) => {
    try {
        const { mobile, firstName, lastName, email, dob, country, countryCode } = req.body;

        if (!mobile || !firstName || !lastName || !countryCode) {
            return response.validationError(res, "All Field Required.")
        }

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
        let updatemob = `+${countryCode}${mobile}`
        console.log(updatemob);
        const sendotp = await towfectorsendOtp(updatemob, otp);
        if (!sendotp) {
            return response.internalServerError(res, "Error while send the otp.")
        }

        let username = `${firstName.substring(0, 2)}${lastName.substring(0, 2)}${generateRandomNumber()}`;

        // Check if the username already exists in the database
        let existingUser = await userDB.findOne({ username });
        while (existingUser) {
            username = `${firstName.substring(0, 2)}${lastName.substring(0, 2)}${generateRandomNumber()}`;
            existingUser = await userDB.findOne({ username });
        }

        // Create new user with OTP
        user = await userDB.create({
            mobile,
            firstName,
            lastName,
            email,
            dob,
            username,
            // otp,
            isVerify: false,
            country,
            countryCode
        });

        let otpEntry = await otpDB.findOne({ userId: user._id });
        if (otpEntry) {
            otpEntry.otp = otp;
            otpEntry.createdAt = Date.now();
            await otpEntry.save();
        } else {
            await otpDB.create({
                userId: user._id,
                otp
            });
        }
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

        const otpEntry = await otpDB.findOne({ userId: user._id, otp });
        if (!otpEntry) {
            return response.validationError(res, "Invalid or expired OTP");
        }

        // OTP is valid, delete OTP entry
        await otpDB.deleteOne({ _id: otpEntry._id });

        // Update user as verified
        user.isVerify = true;
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
        const { countryCode } = user
        let updatemob = `+${countryCode}${mobile}`
        console.log(updatemob);
        const otp = Math.floor(100000 + Math.random() * 900000);
        const sendotp = await towfectorsendOtp(updatemob, otp);
        if (!sendotp) {
            return response.internalServerError(res, "Error while send the otp.")
        }

        let otpEntry = await otpDB.findOne({ userId: user._id });
        if (otpEntry) {
            otpEntry.otp = otp;
            otpEntry.createdAt = Date.now();
            await otpEntry.save();
        } else {
            await otpDB.create({
                userId: user._id,
                otp
            });
        }

        // Update user with the new OTP
        // user.otp = otp;
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

        const otpEntry = await otpDB.findOne({ userId: user._id, otp });
        if (!otpEntry) {
            return response.validationError(res, "Invalid or expired OTP");
        }

        // OTP is valid, delete OTP entry
        await otpDB.deleteOne({ _id: otpEntry._id });

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set token in cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: 'None', // or 'strict'
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Clear OTP after successful verification
        user.otp = null;
        await user.save();

        response.successResponse(res, { token }, "User logged in successfully");
    } catch (error) {
        response.internalServerError(res, error.message)
    }
});


module.exports.hangleLogout = asyncHandler(async (req, res) => {
    res.cookie('userToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        expires: new Date(0) // Set the expiration date to the past
    });
    res.status(200).send({ message: 'Logged out' });
})


module.exports.getUserBytoken = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId
        const findUser = await userDB.findById(userId)
        if (!findUser) {
            return response.notFoundError(res, "User Not found.")
        }
        response.successResponse(res, findUser, "User Data is here.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})


module.exports.uploadPicture = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId
        const findUser = await userDB.findById(userId)
        if (!findUser) {
            return response.notFoundError(res, "User not found.")
        }
        if (!req.file) {
            return response.validationError(res, "Profile pic not found.")
        }
        const upload = await uploadOnCloudinary(req.file)
        if (upload) {
            findUser.profilePicture = upload
        }
        await findUser.save()
        // console.log(req.file);
        response.successResponse(res, findUser, "Profile pic update done.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})

module.exports.uploadCoverPicture = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId
        const findUser = await userDB.findById(userId)
        if (!findUser) {
            return response.notFoundError(res, "User not found.")
        }
        if (!req.file) {
            return response.validationError(res, "Profile pic not found.")
        }
        const upload = await uploadOnCloudinary(req.file)
        if (upload) {
            findUser.coverPhoto = upload
        }
        await findUser.save()
        // console.log(req.file);
        response.successResponse(res, findUser, "Profile pic update done.")
    } catch (error) {
        response.internalServerError(res, error.message)
    }
})

// Update User with all fields
module.exports.updateUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId;
        const updateData = req.body;
        delete updateData.profilePicture
        delete updateData.coverPhoto
        delete updateData.username
        delete updateData.email
        delete updateData.phoneNumber
        const updatedUser = await userDB.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return response.notFoundError(res, "User not found.");
        }

        response.successResponse(res, updatedUser, "User updated successfully.");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

module.exports.googleLogin = asyncHandler(async (req, res) => {
    try {
        const { name, email, picture } = req.body;

        // Split the name into first and last names
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        // Check if the user exists
        let user = await userDB.findOne({ email });

        if (!user) {
            // If user does not exist, create a new user
            let username = `${firstName.substring(0, 2)}${lastName.substring(0, 2)}${generateRandomNumber()}`;

            let existingUser = await userDB.findOne({ username });
            while (existingUser) {
                username = `${firstName.substring(0, 2)}${lastName.substring(0, 2)}${generateRandomNumber()}`;
                existingUser = await userDB.findOne({ username });
            }

            user = await userDB.create({
                firstName,
                lastName,
                email,
                profilePicture: picture,
                username: username,
                isVerify: true
            });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set token in cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: 'None', // or 'strict'
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        response.successResponse(res, { token }, "User logged in successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.sendEmailOtp = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      const userId = req.userId;
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Check if user exists
      const user = await userDB.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Generate and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      const send = await sendMailByNodemailer(email, otp);
      if(!send){
        return response.validationError(res, "Error while send otp")
      }
      // Save OTP to database
      let otpEntry = await otpDB.findOne({ userId });
      if (otpEntry) {
        otpEntry.otp = otp;
        otpEntry.createdAt = Date.now();
        await otpEntry.save();
      } else {
        await otpDB.create({ userId, otp });
      }
  
      response.successResponse(res, null, "OTP sent to email")
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  module.exports.verifyEmailOtp = asyncHandler(async (req, res) => {
    try {
      const { email, otp } = req.body;
      const userId = req.userId;
  
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
      }
  
      // Check if user exists
      const user = await userDB.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verify OTP
      const otpEntry = await otpDB.findOne({ userId, otp });
      if (!otpEntry) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // OTP is valid, delete OTP entry
      await otpDB.deleteOne({ _id: otpEntry._id });
  
      // Update user's email
      user.email = email;
      await user.save();
  
      response.successResponse(res, user, "Email updated successfully")
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  module.exports.sendPhoneOtp = asyncHandler(async (req, res) => {
    try {
      const { countryCode, mobile } = req.body;
      const userId = req.userId;
  
      if (!countryCode || !mobile) {
        return res.status(400).json({ message: 'Country code and mobile number are required' });
      }
  
      // Check if user exists
      const user = await userDB.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Generate and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const updatemob = `+${countryCode}${mobile}`;
  
      const send = await towfectorsendOtp(updatemob, otp);
      if (!send) {
        return response.validationError(res, "Error while sending OTP");
      }
  
      // Save OTP to database
      let otpEntry = await otpDB.findOne({ userId });
      if (otpEntry) {
        otpEntry.otp = otp;
        otpEntry.createdAt = Date.now();
        await otpEntry.save();
      } else {
        await otpDB.create({ userId, otp });
      }
  
      response.successResponse(res, null, "OTP sent to phone");
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports.verifyPhoneOtp = asyncHandler(async (req, res) => {
    try {
      const { countryCode, mobile, otp } = req.body;
      const userId = req.userId;
  
      if (!countryCode || !mobile || !otp) {
        return res.status(400).json({ message: 'Country code, mobile, and OTP are required' });
      }
  
      // Check if user exists
      const user = await userDB.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verify OTP
      const otpEntry = await otpDB.findOne({ userId, otp });
      if (!otpEntry) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // OTP is valid, delete OTP entry
      await otpDB.deleteOne({ _id: otpEntry._id });
  
      // Update user's phone number
      user.mobile = mobile;
      user.countryCode = countryCode;
      await user.save();
  
      response.successResponse(res, user, "Phone number updated successfully");
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
