const router = require("express").Router()
const admin = require("../controller/adminController")

router.post("/create", admin.createAdmin)
router.post("/login", admin.loginAdmin)

module.exports = router;