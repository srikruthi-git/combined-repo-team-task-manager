const { getDb } = require("../database/db");

const listByProjectId = (projectId) => {
  const db = getDb();
  return db
    .prepare(
      `SELECT pm.id, pm.project_id, pm.user_id, pm.added_at, u.username, u.role
       FROM project_members pm
       INNER JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ?
       ORDER BY u.username ASC`
    )
    .all(projectId);
};

const isMember = (projectId, userId) => {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?"
    )
    .get(projectId, userId);
  return Boolean(row);
};

const addMember = (member) => {
  const db = getDb();
  db.prepare(
    "INSERT INTO project_members (id, project_id, user_id, added_at) VALUES (?, ?, ?, ?)"
  ).run(member.id, member.projectId, member.userId, member.addedAt);
};

const removeMember = (projectId, userId) => {
  const db = getDb();
  db.prepare(
    "DELETE FROM project_members WHERE project_id = ? AND user_id = ?"
  ).run(projectId, userId);
};

module.exports = { listByProjectId, isMember, addMember, removeMember };
