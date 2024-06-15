const router = require("express").Router()
const admin = require("../controller/adminController");
const { checkAdmin } = require("../middleware/authMiddleware");

router.post("/create", admin.createAdmin)
router.post("/login", admin.loginAdmin)
router.post('/update-settings', checkAdmin, admin.updateAdminSettings);

module.exports = router;