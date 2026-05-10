const express = require("express");
const taskController = require("../controllers/taskController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", taskController.listTasks);
router.post("/", requireAdmin, taskController.createTask);
router.put("/:taskId", requireAdmin, taskController.updateTask);
router.delete("/:taskId", requireAdmin, taskController.deleteTask);
router.patch("/:taskId/status", taskController.updateTaskStatus);

module.exports = router;
