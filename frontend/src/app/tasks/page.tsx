"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../../guards/RequireAuth";
import AppShell from "../../components/AppShell";
import { getAuth, type AuthUser } from "../../auth/authStorage";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  updateTaskStatus,
  type Task,
} from "../../services/api/tasks";
import {
  listProjects,
  listProjectMembers,
  type Project,
  type ProjectMember,
} from "../../services/api/projects";
import { listUsers, type User } from "../../services/api/users";

const statusOptions = ["Todo", "In Progress", "Completed"] as const;

const toDateInput = (value: string | null) => {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
};

export default function TasksPage() {
  const [role, setRole] = useState<"Admin" | "Member" | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [membersByProject, setMembersByProject] = useState<
    Record<string, ProjectMember[]>
  >({});
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ projectId: "", status: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    status: "Todo",
    dueDate: "",
  });
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});

  const projectLookup = useMemo(() => {
    return Object.fromEntries(projects.map((project) => [project.id, project]));
  }, [projects]);

  const userLookup = useMemo(() => {
    return Object.fromEntries(users.map((entry) => [entry.id, entry.username]));
  }, [users]);

  const loadTasks = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const response = await listTasks({
        projectId: nextFilters.projectId || undefined,
        status: nextFilters.status || undefined,
      });
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMembers = async (projectId: string) => {
    if (!projectId) {
      return;
    }
    const response = await listProjectMembers(projectId);
    setMembersByProject((prev) => ({ ...prev, [projectId]: response.members }));
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      return;
    }

    setRole(auth.user.role);
    setUser(auth.user);

    const bootstrap = async () => {
      try {
        const projectResponse = await listProjects();
        setProjects(projectResponse.projects);

        if (auth.user.role === "Admin") {
          const usersResponse = await listUsers();
          setUsers(usersResponse.users);
        } else {
          setUsers([{ id: auth.user.id, username: auth.user.username, role: auth.user.role }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load data");
      } finally {
        await loadTasks();
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (form.projectId && role === "Admin") {
      loadProjectMembers(form.projectId).catch(() => null);
    }
  }, [form.projectId, role]);

  const handleCreateOrUpdate = async () => {
    if (!form.projectId || !form.assignedTo) {
      setError("Project and assignee are required");
      return;
    }

    setError(null);

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, {
          title: form.title,
          description: form.description,
          status: form.status,
          dueDate: form.dueDate || null,
          assignedTo: form.assignedTo,
        });
      } else {
        await createTask({
          title: form.title,
          description: form.description,
          projectId: form.projectId,
          assignedTo: form.assignedTo,
          status: form.status,
          dueDate: form.dueDate || null,
        });
      }

      setForm({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        status: "Todo",
        dueDate: "",
      });
      setEditingTaskId(null);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      projectId: task.project_id,
      assignedTo: task.assigned_to || "",
      status: task.status,
      dueDate: toDateInput(task.due_date),
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setError(null);
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete task");
    }
  };

  const handleStatusUpdate = async (taskId: string) => {
    const nextStatus = statusUpdates[taskId];
    if (!nextStatus) {
      return;
    }

    try {
      await updateTaskStatus(taskId, nextStatus);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status");
    }
  };

  return (
    <RequireAuth>
      <AppShell>
        <div className="stack">
          <div>
            <div className="section-title">Tasks</div>
            <div className="muted">
              Track, assign, and deliver tasks aligned to active projects.
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          {role === "Admin" && (
            <div className="card">
              <div className="card-title">
                {editingTaskId ? "Edit task" : "Create task"}
              </div>
              <div className="form-grid" style={{ marginTop: "12px" }}>
                <div className="form-row">
                  <label className="label">Title</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>
                <div className="form-row">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid-2">
                  <div className="form-row">
                    <label className="label">Project</label>
                    <select
                      className="select"
                      value={form.projectId}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          projectId: event.target.value,
                          assignedTo: "",
                        }))
                      }
                    >
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="label">Assign to</label>
                    <select
                      className="select"
                      value={form.assignedTo}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          assignedTo: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select member</option>
                      {(membersByProject[form.projectId] || []).map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-row">
                    <label className="label">Status</label>
                    <select
                      className="select"
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="label">Due date</label>
                    <input
                      type="date"
                      className="input"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          dueDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateOrUpdate}
                  >
                    {editingTaskId ? "Save changes" : "Create task"}
                  </button>
                  {editingTaskId && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditingTaskId(null);
                        setForm({
                          title: "",
                          description: "",
                          projectId: "",
                          assignedTo: "",
                          status: "Todo",
                          dueDate: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-title">Filter tasks</div>
            <div className="grid-2" style={{ marginTop: "12px" }}>
              <div className="form-row">
                <label className="label">Project</label>
                <select
                  className="select"
                  value={filters.projectId}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      projectId: event.target.value,
                    }))
                  }
                >
                  <option value="">All projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label className="label">Status</label>
                <select
                  className="select"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="button-row" style={{ marginTop: "12px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => loadTasks(filters)}
              >
                Apply filters
              </button>
            </div>
          </div>
          {loading ? (
            <div className="page-loader">Loading tasks...</div>
          ) : (
            <div className="list">
              {tasks.map((task) => (
                <div key={task.id} className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{task.title}</div>
                      <div className="muted">
                        Project: {projectLookup[task.project_id]?.name || "Unknown"}
                      </div>
                    </div>
                    {role === "Admin" && (
                      <div className="button-row">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="stack" style={{ marginTop: "12px" }}>
                    <div className="muted">{task.description || "No description"}</div>
                    <div className="button-row">
                      <span className="status-pill">Status: {task.status}</span>
                      {task.due_date && (
                        <span className="status-pill">
                          Due: {toDateInput(task.due_date)}
                        </span>
                      )}
                      <span className="status-pill">
                        Assignee: {userLookup[task.assigned_to || ""] || "Unassigned"}
                      </span>
                    </div>
                    {role === "Member" && task.assigned_to === user?.id && (
                      <div className="button-row">
                        <select
                          className="select"
                          value={statusUpdates[task.id] || task.status}
                          onChange={(event) =>
                            setStatusUpdates((prev) => ({
                              ...prev,
                              [task.id]: event.target.value,
                            }))
                          }
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleStatusUpdate(task.id)}
                        >
                          Update status
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
