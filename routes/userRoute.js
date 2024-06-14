const router = require("express").Router()
const user = require("../controller/userController")

router.post("/create", user.createUser )
router.post("/create/verify", user.verifyUser)
router.post("/login", user.loginUser)
router.post("/login/verify", user.verifyLoginOtp)

module.exports = router;