const crypto = require("crypto");
const projectModel = require("../models/projectModel");
const projectMemberModel = require("../models/projectMemberModel");
const taskModel = require("../models/taskModel");
const { sendSuccess, sendError } = require("../utils/response");
const { validateTask, validateStatus } = require("../validators/taskValidator");

const listTasks = (req, res) => {
  const filters = {
    projectId: req.query.projectId || null,
    status: req.query.status || null,
    assignedTo: req.user.role === "Member" ? req.user.id : null,
  };

  const tasks = taskModel.listTasks(filters);
  return sendSuccess(res, { tasks });
};

const createTask = (req, res) => {
  const payload = {
    projectId: req.body.projectId,
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "Todo",
    dueDate: req.body.dueDate || null,
    assignedTo: req.body.assignedTo,
  };

  const errors = validateTask(payload);
  if (errors.length) {
    return sendError(res, 400, errors.join(", "));
  }

  const project = projectModel.getById(payload.projectId);
  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  if (!projectMemberModel.isMember(payload.projectId, payload.assignedTo)) {
    return sendError(res, 400, "Assigned user is not a project member");
  }

  const now = new Date().toISOString();
  const task = taskModel.create({
    id: crypto.randomUUID(),
    projectId: payload.projectId,
    title: payload.title,
    description: payload.description,
    status: payload.status,
    dueDate: payload.dueDate,
    assignedTo: payload.assignedTo,
    createdBy: req.user.id,
    createdAt: now,
    updatedAt: now,
  });

  return sendSuccess(res, { task });
};

const updateTask = (req, res) => {
  const existing = taskModel.getById(req.params.taskId);
  if (!existing) {
    return sendError(res, 404, "Task not found");
  }

  const payload = {
    projectId: existing.project_id,
    title: req.body.title ?? existing.title,
    description: req.body.description ?? existing.description,
    status: req.body.status ?? existing.status,
    dueDate:
      req.body.dueDate === ""
        ? null
        : req.body.dueDate ?? existing.due_date,
    assignedTo: req.body.assignedTo ?? existing.assigned_to,
  };

  const errors = validateTask(payload);
  if (errors.length) {
    return sendError(res, 400, errors.join(", "));
  }

  if (!projectMemberModel.isMember(payload.projectId, payload.assignedTo)) {
    return sendError(res, 400, "Assigned user is not a project member");
  }

  const updated = taskModel.update(req.params.taskId, {
    title: payload.title,
    description: payload.description,
    status: payload.status,
    dueDate: payload.dueDate,
    assignedTo: payload.assignedTo,
    updatedAt: new Date().toISOString(),
  });

  return sendSuccess(res, { task: updated });
};

const deleteTask = (req, res) => {
  const existing = taskModel.getById(req.params.taskId);
  if (!existing) {
    return sendError(res, 404, "Task not found");
  }

  taskModel.remove(req.params.taskId);
  return sendSuccess(res, { message: "Task deleted" });
};

const updateTaskStatus = (req, res) => {
  const existing = taskModel.getById(req.params.taskId);
  if (!existing) {
    return sendError(res, 404, "Task not found");
  }

  if (req.user.role === "Member" && existing.assigned_to !== req.user.id) {
    return sendError(res, 403, "Forbidden");
  }

  const { status } = req.body || {};
  const errors = validateStatus(status);
  if (errors.length) {
    return sendError(res, 400, errors.join(", "));
  }

  const updated = taskModel.updateStatus(
    req.params.taskId,
    status,
    new Date().toISOString()
  );

  return sendSuccess(res, { task: updated });
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
