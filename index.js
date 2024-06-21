const express = require("express")
const http = require('http');
const cors = require("cors")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const { connectDB } = require('./db/connect');


const adminRoute = require("./routes/adminRoute")
const userRoute = require("./routes/userRoute")
const wishlistRoute = require("./routes/wishlistRoute")
const paperTradingRoute = require("./routes/paperTradingRoute")

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors({
    origin: true, // Allow all origins
    credentials: true // Allow credentials
}));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.status(200).json({ message: "Coin Yoga server is running" })
})

app.use("/api/admin", adminRoute)
app.use("/api/user", userRoute)
app.use("/api/wishlist", wishlistRoute)
app.use("/api/paper/order", paperTradingRoute)



connectDB(process.env.MONGO_URI);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});