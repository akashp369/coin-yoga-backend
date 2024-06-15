const jwt = require("jsonwebtoken");
const adminDB = require("../model/adminModel");
require('dotenv').config();

// Middleware to check if a user is authenticated
const checkUser = async (req, res, next) => {
    let token;
    // console.log(req.cookies);
    if (req.cookies && req.cookies.userToken) {
        try {
            token = req.cookies.userToken;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decoded);
            req.userId = decoded.id;
            // console.log(req.userId);
            next();
        } catch (error) {
            return res.status(401).json({ message: 'User not authorized' });
        }
    } else {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }
};

// Middleware to check if an admin is authenticated and authorized
const checkAdmin = async (req, res, next) => {
    let token;
    // console.log(req.cookies);
    // Check for token in cookies
    if (req.cookies && req.cookies.adminToken) {
        try {
            token = req.cookies.adminToken;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decoded);
            const user = await adminDB.findById({ _id: decoded.id });
            const { password, createdAt, updatedAt, ...others } = user._doc;
            req.user = others;
            // console.log(req.user);
            if (req.user.role === "admin") {
                next();
            } else {
                res.status(401).json({ message: "The user is not an admin" });
            }
        } catch (err) {
            res.status(401).json({ message: "Unauthorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Admin not authorized" });
    }
}

module.exports = { checkUser, checkAdmin };



// const checkUser = async (req, res, next) => {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWTSECRET);
//             req.userId = decoded.userId;
//             next();
//         } catch (error) {
//             return res.status(401).json({ message: 'User not authorized' });
//         }
//     } else {
//         return res.status(401).json({ message: 'Authorization token is missing' });
//     }
// };


// const checkAdmin = async (req, res, next) => {
//     var token
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWTSECRET);
//             const user = await adminDB.findById({ _id: decoded.adminId });
//             const { password, createdAt, updatedAt, ...others } = user._doc;
//             req.user = others;
//             console.log(req.user);
//             if (req.user.role==="admin") {
//                 next();
//             }
//             else {
//                 res.status(401).json({ message: "The user is not an admin" });
//             }
//         } catch (err) {
//             res.status(401).json({ message: "Unauthorized, token failed" });
//         }
//     } else {
//         res.status(401).json({ message: "Admin not authorized" });
//     }
// }
