const taskModel = require("../models/taskModel");
const { sendSuccess } = require("../utils/response");

const buildStats = (tasks, role) => {
  const totals = {
    totalTasks: tasks.length,
    tasksByStatus: {
      Todo: 0,
      "In Progress": 0,
      Completed: 0,
    },
    overdueTasks: 0,
    completedTasks: 0,
    assignedTasks: 0,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {
    if (totals.tasksByStatus[task.status] !== undefined) {
      totals.tasksByStatus[task.status] += 1;
    }

    if (task.status === "Completed") {
      totals.completedTasks += 1;
    }

    if (task.assigned_to) {
      totals.assignedTasks += 1;
    }

    if (task.due_date && task.status !== "Completed") {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        totals.overdueTasks += 1;
      }
    }
  });

  if (role === "Member") {
    totals.assignedTasks = totals.totalTasks;
  }

  return totals;
};

const getDashboard = (req, res) => {
  const filters = {
    assignedTo: req.user.role === "Member" ? req.user.id : null,
  };
  const tasks = taskModel.listTasks(filters);

  return sendSuccess(res, {
    stats: buildStats(tasks, req.user.role),
  });
};

module.exports = { getDashboard };
