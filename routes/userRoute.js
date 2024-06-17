const router = require("express").Router()
const user = require("../controller/userController")
const { checkUser } = require("../middleware/authMiddleware")
const upload = require("../middleware/Multer")

router.post("/create", user.createUser )
router.post("/create/verify", user.verifyUser)
router.post("/login", user.loginUser)
router.post("/login/verify", user.verifyLoginOtp)
router.get("/logout", user.hangleLogout)
router.get("/single", checkUser, user.getUserBytoken)
router.put("/profilepic", checkUser, upload.single("pic"), user.uploadPicture)
router.put("/coverpic", checkUser, upload.single("pic"), user.uploadCoverPicture)
router.put("/update", checkUser,  user.updateUser)

module.exports = router;