const express = require("express");
const projectController = require("../controllers/projectController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", projectController.listProjects);
router.post("/", requireAdmin, projectController.createProject);
router.put("/:projectId", requireAdmin, projectController.updateProject);
router.delete("/:projectId", requireAdmin, projectController.deleteProject);
router.get("/:projectId/members", requireAdmin, projectController.listMembers);
router.post("/:projectId/members", requireAdmin, projectController.addMember);
router.delete(
  "/:projectId/members/:memberId",
  requireAdmin,
  projectController.removeMember
);

module.exports = router;
