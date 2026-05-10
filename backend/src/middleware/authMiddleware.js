const { sendError } = require("../utils/response");
const authService = require("../services/authService");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  const user = authService.getUserByToken(token);

  if (!user) {
    return sendError(res, 401, "Unauthorized");
  }

  req.user = user;
  return next();
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  if (!roles.includes(req.user.role)) {
    return sendError(res, 403, "Forbidden");
  }

  return next();
};

const requireAdmin = requireRole(["Admin"]);

module.exports = { requireAuth, requireRole, requireAdmin };
