const jwt = require("jsonwebtoken")
const adminDB = require("../models/adminModel")
require('dotenv').config();


const checkLogin = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWTSECRET);
            req.userId = decoded.userId;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'User not authorized' });
        }
    } else {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }
};


const checkAdmin = async (req, res, next) => {
    var token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWTSECRET);
            const user = await adminDB.findById({ _id: decoded.adminId });
            const { password, createdAt, updatedAt, ...others } = user._doc;
            req.user = others;
            console.log(req.user);
            if (req.user.role==="admin") {
                next();
            }
            else {
                res.status(401).json({ message: "The user is not an admin" });
            }
        } catch (err) {
            res.status(401).json({ message: "Unauthorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Admin not authorized" });
    }
}

module.exports = { checkLogin, checkAdmin }