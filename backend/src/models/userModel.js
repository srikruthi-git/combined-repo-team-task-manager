const { getDb } = require("../database/db");

const getByUsername = (username) => {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
};

const getById = (id) => {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
};

const listAll = () => {
  const db = getDb();
  return db.prepare("SELECT id, username, role FROM users").all();
};

module.exports = { getByUsername, getById, listAll };
