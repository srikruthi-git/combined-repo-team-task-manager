const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", requireAdmin, userController.listUsers);

module.exports = router;
