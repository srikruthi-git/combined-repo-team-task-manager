const { getDb } = require("../database/db");

const listAll = () => {
  const db = getDb();
  return db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
};

const listByUserId = (userId) => {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.*
       FROM projects p
       INNER JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`
    )
    .all(userId);
};

const getById = (projectId) => {
  const db = getDb();
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId);
};

const create = (project) => {
  const db = getDb();
  db.prepare(
    "INSERT INTO projects (id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(
    project.id,
    project.name,
    project.description,
    project.createdBy,
    project.createdAt
  );
  return getById(project.id);
};

const update = (projectId, updates) => {
  const db = getDb();
  db.prepare(
    "UPDATE projects SET name = ?, description = ? WHERE id = ?"
  ).run(updates.name, updates.description, projectId);
  return getById(projectId);
};

const remove = (projectId) => {
  const db = getDb();
  db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
  db.prepare("DELETE FROM project_members WHERE project_id = ?").run(projectId);
  db.prepare("DELETE FROM tasks WHERE project_id = ?").run(projectId);
};

module.exports = { listAll, listByUserId, getById, create, update, remove };
