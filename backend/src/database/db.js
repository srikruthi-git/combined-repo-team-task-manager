const Database = require("better-sqlite3");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const config = require("../config/env");

let db;

const ensureDbDir = () => {
  const dir = path.dirname(config.dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const initializeSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_members (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      added_at TEXT NOT NULL,
      UNIQUE(project_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      due_date TEXT,
      assigned_to TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_project_members_project
      ON project_members(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_members_user
      ON project_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project
      ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned
      ON tasks(assigned_to);
  `);
};

const seedDemoUsers = () => {
  const demoUsers = [
    { id: "user_admin", username: "admin", password: "admin123", role: "Admin" },
    {
      id: "user_member",
      username: "member",
      password: "member123",
      role: "Member",
    },
    {
      id: "user_saharsh",
      username: "saharsh",
      password: "member123",
      role: "Member",
    },
    {
      id: "user_rahul",
      username: "rahul",
      password: "member123",
      role: "Member",
    },
    {
      id: "user_priya",
      username: "priya",
      password: "member123",
      role: "Member",
    },
    {
      id: "user_arjun",
      username: "arjun",
      password: "member123",
      role: "Member",
    },
    {
      id: "user_sneha",
      username: "sneha",
      password: "member123",
      role: "Member",
    },
  ];

  const selectUser = db.prepare("SELECT 1 FROM users WHERE username = ?");
  const insertUser = db.prepare(
    "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)"
  );

  demoUsers.forEach((user) => {
    const existing = selectUser.get(user.username);
    if (!existing) {
      insertUser.run(user.id, user.username, user.password, user.role);
    }
  });
};

const seedDemoData = () => {
  const projectCount = db.prepare("SELECT COUNT(1) AS count FROM projects").get()
    .count;

  if (projectCount > 0) {
    return;
  }

  const now = new Date();
  const toIso = (date) => date.toISOString();
  const daysFromNow = (days) => {
    const copy = new Date(now);
    copy.setDate(copy.getDate() + days);
    return toIso(copy);
  };

  const projects = [
    {
      id: "project_resume",
      name: "AI Resume Analyzer",
      description:
        "AI-powered resume screening and candidate scoring platform.",
    },
    {
      id: "project_dashboard",
      name: "Team Task Dashboard",
      description: "Internal task tracking and productivity management system.",
    },
    {
      id: "project_interview",
      name: "Smart Interview Assistant",
      description: "AI interview preparation and evaluation platform.",
    },
  ];

  const insertProject = db.prepare(
    "INSERT INTO projects (id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)"
  );

  projects.forEach((project) => {
    insertProject.run(
      project.id,
      project.name,
      project.description,
      "user_admin",
      toIso(now)
    );
  });

  const memberAssignments = [
    { projectId: "project_resume", userId: "user_admin" },
    { projectId: "project_resume", userId: "user_saharsh" },
    { projectId: "project_resume", userId: "user_priya" },
    { projectId: "project_dashboard", userId: "user_admin" },
    { projectId: "project_dashboard", userId: "user_rahul" },
    { projectId: "project_dashboard", userId: "user_sneha" },
    { projectId: "project_interview", userId: "user_admin" },
    { projectId: "project_interview", userId: "user_arjun" },
    { projectId: "project_interview", userId: "user_member" },
  ];

  const selectMember = db.prepare(
    "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?"
  );
  const insertMember = db.prepare(
    "INSERT INTO project_members (id, project_id, user_id, added_at) VALUES (?, ?, ?, ?)"
  );

  memberAssignments.forEach((assignment) => {
    const existing = selectMember.get(
      assignment.projectId,
      assignment.userId
    );
    if (!existing) {
      insertMember.run(
        crypto.randomUUID(),
        assignment.projectId,
        assignment.userId,
        toIso(now)
      );
    }
  });

  const tasks = [
    {
      id: "task_resume_login",
      projectId: "project_resume",
      title: "Build login UI",
      description: "Design the candidate login and admin access screens.",
      status: "Completed",
      dueDate: daysFromNow(-6),
      assignedTo: "user_priya",
    },
    {
      id: "task_resume_api",
      projectId: "project_resume",
      title: "Integrate AI scoring API",
      description: "Connect the resume parser with the scoring microservice.",
      status: "In Progress",
      dueDate: daysFromNow(3),
      assignedTo: "user_saharsh",
    },
    {
      id: "task_resume_analytics",
      projectId: "project_resume",
      title: "Create analytics dashboard",
      description: "Surface hiring funnel metrics and candidate scores.",
      status: "Todo",
      dueDate: daysFromNow(10),
      assignedTo: "user_admin",
    },
    {
      id: "task_dashboard_filter",
      projectId: "project_dashboard",
      title: "Implement task filtering",
      description: "Enable filters by status, assignee, and due date.",
      status: "In Progress",
      dueDate: daysFromNow(2),
      assignedTo: "user_rahul",
    },
    {
      id: "task_dashboard_members",
      projectId: "project_dashboard",
      title: "Add member management",
      description: "Allow admins to add and remove project members.",
      status: "Completed",
      dueDate: daysFromNow(-2),
      assignedTo: "user_sneha",
    },
    {
      id: "task_dashboard_api",
      projectId: "project_dashboard",
      title: "Create project APIs",
      description: "Expose endpoints for project creation and updates.",
      status: "Todo",
      dueDate: daysFromNow(6),
      assignedTo: "user_admin",
    },
    {
      id: "task_interview_chatbot",
      projectId: "project_interview",
      title: "Build chatbot interface",
      description: "Launch a conversational UI for mock interviews.",
      status: "In Progress",
      dueDate: daysFromNow(1),
      assignedTo: "user_member",
    },
    {
      id: "task_interview_voice",
      projectId: "project_interview",
      title: "Add voice support",
      description: "Enable speech capture and response playback.",
      status: "Todo",
      dueDate: daysFromNow(12),
      assignedTo: "user_arjun",
    },
    {
      id: "task_interview_ui",
      projectId: "project_interview",
      title: "Improve dashboard UI",
      description: "Refine evaluation summaries and feedback cards.",
      status: "Completed",
      dueDate: daysFromNow(-8),
      assignedTo: "user_admin",
    },
  ];

  const insertTask = db.prepare(
    `INSERT INTO tasks
      (id, project_id, title, description, status, due_date, assigned_to, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  tasks.forEach((task) => {
    insertTask.run(
      task.id,
      task.projectId,
      task.title,
      task.description,
      task.status,
      task.dueDate,
      task.assignedTo,
      "user_admin",
      toIso(now),
      toIso(now)
    );
  });
};

const initDatabase = () => {
  if (db) {
    return db;
  }

  ensureDbDir();
  db = new Database(config.dbFile);
  db.pragma("journal_mode = WAL");
  initializeSchema();
  seedDemoUsers();
  seedDemoData();
  return db;
};

const getDb = () => {
  if (!db) {
    return initDatabase();
  }
  return db;
};

module.exports = { initDatabase, getDb };
