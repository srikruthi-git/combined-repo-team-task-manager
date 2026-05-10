const userModel = require("../models/userModel");

const tokensByUsername = {
  admin: "demo-admin-token",
  member: "demo-member-token",
};

const getTokenForUser = (user) => tokensByUsername[user.username];

const getUserByToken = (token) => {
  if (!token) {
    return null;
  }

  const username = Object.keys(tokensByUsername).find(
    (key) => tokensByUsername[key] === token
  );

  if (!username) {
    return null;
  }

  return userModel.getByUsername(username);
};

module.exports = { getTokenForUser, getUserByToken };
