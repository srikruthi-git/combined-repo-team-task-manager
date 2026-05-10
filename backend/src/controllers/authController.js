const userModel = require("../models/userModel");
const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/response");
const { validateLogin } = require("../validators/authValidator");

const login = (req, res) => {
  const errors = validateLogin(req.body || {});
  if (errors.length) {
    return sendError(res, 400, errors.join(", "));
  }

  const username = String(req.body.username || "").trim().toLowerCase();
  const password = req.body.password;

  if (!username) {
    return sendError(res, 400, "Username is required");
  }

  const user = userModel.getByUsername(username);

  if (!user || user.password !== password) {
    return sendError(res, 401, "Invalid credentials");
  }

  const token = authService.getTokenForUser(user);

  return sendSuccess(res, {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    token,
  });
};

module.exports = { login };
