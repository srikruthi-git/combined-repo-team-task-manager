const express = require("express");
const authRoutes = require("./authRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require("./taskRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);

module.exports = router;
