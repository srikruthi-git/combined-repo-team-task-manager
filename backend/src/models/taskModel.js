const { getDb } = require("../database/db");

const listTasks = (filters) => {
  const db = getDb();
  const conditions = [];
  const params = [];

  if (filters.projectId) {
    conditions.push("project_id = ?");
    params.push(filters.projectId);
  }

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.assignedTo) {
    conditions.push("assigned_to = ?");
    params.push(filters.assignedTo);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const query = `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC`;
  return db.prepare(query).all(...params);
};

const getById = (taskId) => {
  const db = getDb();
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
};

const create = (task) => {
  const db = getDb();
  db.prepare(
    `INSERT INTO tasks
      (id, project_id, title, description, status, due_date, assigned_to, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    task.id,
    task.projectId,
    task.title,
    task.description,
    task.status,
    task.dueDate,
    task.assignedTo,
    task.createdBy,
    task.createdAt,
    task.updatedAt
  );
  return getById(task.id);
};

const update = (taskId, updates) => {
  const db = getDb();
  db.prepare(
    `UPDATE tasks
      SET title = ?, description = ?, status = ?, due_date = ?, assigned_to = ?, updated_at = ?
      WHERE id = ?`
  ).run(
    updates.title,
    updates.description,
    updates.status,
    updates.dueDate,
    updates.assignedTo,
    updates.updatedAt,
    taskId
  );
  return getById(taskId);
};

const updateStatus = (taskId, status, updatedAt) => {
  const db = getDb();
  db.prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?").run(
    status,
    updatedAt,
    taskId
  );
  return getById(taskId);
};

const remove = (taskId) => {
  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
};

module.exports = { listTasks, getById, create, update, updateStatus, remove };
