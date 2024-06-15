const axios = require("axios");
require("dotenv").config();

module.exports.towfectorsendOtp = async (mobile, otp) => {
    try {
        const apiKey = process.env.API_KEY_2FACTOR; 
        // const url = `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/AUTOGEN/${otp}`;
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/${otp}/OTP1`
        const res = await axios.get(url);
        console.log(res);
        if(res.status==200){
            return res.data;
        }
        return null
    } catch (error) {
        console.error("Error sending OTP:", error);
        return null;
    }
};
