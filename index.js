const express = require("express")
const http = require('http');
const cors = require("cors")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); 
require('dotenv').config();
const { connectDB } = require('./db/connect');

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(cookieParser()); 


app.get("/", (req, res) => {
    res.status(200).json({ message: "Coin Yoga server is running" })
})


app.post("/user-login", (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "User token is required" });
    }
    res.cookie('userToken', token, {
        httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent only over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({ message: "User token set in cookie" });
});

// Simulate admin login
app.post("/admin-login", (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Admin token is required" });
    }
    res.cookie('adminToken', token, {
        httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent only over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({ message: "Admin token set in cookie" });
});

connectDB(process.env.MONGO_URI);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});