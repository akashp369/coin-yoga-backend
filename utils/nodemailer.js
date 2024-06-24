const nodemailer = require('nodemailer');

require("dotenv").config()

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASS,
    },
  });


  module.exports.sendMailByNodemailer = async(email, otp)=>{
    try {
        var mailOptions = {
            from: process.env.APP_EMAIL,
            to: email,
            subject: 'Verify Your Email',
            text: `Your OTP for verify E-mail is: ${otp}`
          };
          const send = await transporter.sendMail(mailOptions);
          if(send){
            return send
          }
    } catch (error) {
        
    }
  }