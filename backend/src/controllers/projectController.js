const crypto = require("crypto");
const projectModel = require("../models/projectModel");
const projectMemberModel = require("../models/projectMemberModel");
const userModel = require("../models/userModel");
const { sendSuccess, sendError } = require("../utils/response");
const { validateProject } = require("../validators/projectValidator");

const listProjects = (req, res) => {
  const projects =
    req.user.role === "Admin"
      ? projectModel.listAll()
      : projectModel.listByUserId(req.user.id);

  return sendSuccess(res, { projects });
};

const createProject = (req, res) => {
  const errors = validateProject(req.body || {});
  if (errors.length) {
    return sendError(res, 400, errors.join(", "));
  }

  const projectId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const project = projectModel.create({
    id: projectId,
    name: req.body.name,
    description: req.body.description || "",
    createdBy: req.user.id,
    createdAt,
  });

  projectMemberModel.addMember({
    id: crypto.randomUUID(),
    projectId,
    userId: req.user.id,
    addedAt: createdAt,
  });

  return sendSuccess(res, { project });
};

const updateProject = (req, res) => {
  const project = projectModel.getById(req.params.projectId);
  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  const payload = {
    name: req.body.name ?? project.name,
    description: req.body.description ?? project.description,
  };

  const errors = validateProject(payload);
  if (errors.length) {
    return sendError(res, 400, errors.join(", "));
  }

  const updated = projectModel.update(req.params.projectId, payload);
  return sendSuccess(res, { project: updated });
};

const deleteProject = (req, res) => {
  const project = projectModel.getById(req.params.projectId);
  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  projectModel.remove(req.params.projectId);
  return sendSuccess(res, { message: "Project deleted" });
};

const listMembers = (req, res) => {
  const project = projectModel.getById(req.params.projectId);
  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  const members = projectMemberModel.listByProjectId(req.params.projectId);
  return sendSuccess(res, { members });
};

const addMember = (req, res) => {
  const project = projectModel.getById(req.params.projectId);
  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  const { username, userId } = req.body || {};
  const normalizedUsername = username
    ? String(username).trim().toLowerCase()
    : "";

  if (!normalizedUsername && !userId) {
    return sendError(res, 400, "Username or userId is required");
  }

  const user = userId
    ? userModel.getById(userId)
    : userModel.getByUsername(normalizedUsername);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  if (projectMemberModel.isMember(req.params.projectId, user.id)) {
    return sendError(res, 400, "User is already a project member");
  }

  projectMemberModel.addMember({
    id: crypto.randomUUID(),
    projectId: req.params.projectId,
    userId: user.id,
    addedAt: new Date().toISOString(),
  });

  const members = projectMemberModel.listByProjectId(req.params.projectId);
  return sendSuccess(res, {
    message: "Member added successfully",
    members,
  });
};

const removeMember = (req, res) => {
  const project = projectModel.getById(req.params.projectId);
  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  projectMemberModel.removeMember(req.params.projectId, req.params.memberId);
  const members = projectMemberModel.listByProjectId(req.params.projectId);
  return sendSuccess(res, { members });
};

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listMembers,
  addMember,
  removeMember,
};
