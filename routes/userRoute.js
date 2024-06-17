const router = require("express").Router()
const user = require("../controller/userController")
const { checkUser } = require("../middleware/authMiddleware")

router.post("/create", user.createUser )
router.post("/create/verify", user.verifyUser)
router.post("/login", user.loginUser)
router.post("/login/verify", user.verifyLoginOtp)
router.get("/logout", user.hangleLogout)
router.get("/single", checkUser, user.getUserBytoken)

module.exports = router;