const userModel = require("../models/userModel");
const { sendSuccess } = require("../utils/response");

const listUsers = (req, res) => {
  const users = userModel.listAll();
  return sendSuccess(res, { users });
};

module.exports = { listUsers };
