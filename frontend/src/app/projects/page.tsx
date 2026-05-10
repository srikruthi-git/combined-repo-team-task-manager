"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../guards/RequireAuth";
import AppShell from "../../components/AppShell";
import { getAuth } from "../../auth/authStorage";
import {
  addProjectMember,
  createProject,
  deleteProject,
  listProjectMembers,
  listProjects,
  removeProjectMember,
  updateProject,
  type Project,
  type ProjectMember,
} from "../../services/api/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [membersByProject, setMembersByProject] = useState<
    Record<string, ProjectMember[]>
  >({});
  const [role, setRole] = useState<"Admin" | "Member" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProject, setEditProject] = useState({ name: "", description: "" });
  const [memberInputs, setMemberInputs] = useState<Record<string, string>>({});
  const [memberLoading, setMemberLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [memberNotice, setMemberNotice] = useState<
    Record<string, { type: "success" | "error"; message: string }>
  >({});

  const loadProjects = async (currentRole: "Admin" | "Member") => {
    try {
      setLoading(true);
      const response = await listProjects();
      setProjects(response.projects);

      if (currentRole === "Admin") {
        const memberEntries = await Promise.all(
          response.projects.map(async (project) => {
            const membersResponse = await listProjectMembers(project.id);
            return [project.id, membersResponse.members] as const;
          })
        );
        setMembersByProject(Object.fromEntries(memberEntries));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const currentRole = auth?.user.role ?? null;
    setRole(currentRole);

    if (currentRole) {
      loadProjects(currentRole);
    }
  }, []);

  const handleCreateProject = async () => {
    setError(null);
    try {
      await createProject(newProject);
      setNewProject({ name: "", description: "" });
      if (role) {
        await loadProjects(role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project");
    }
  };

  const handleUpdateProject = async (projectId: string) => {
    setError(null);
    try {
      await updateProject(projectId, editProject);
      setEditingProjectId(null);
      if (role) {
        await loadProjects(role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setError(null);
    try {
      await deleteProject(projectId);
      if (role) {
        await loadProjects(role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project");
    }
  };

  const handleAddMember = async (projectId: string) => {
    const rawUsername = memberInputs[projectId] || "";
    const username = rawUsername.trim();

    if (!username || memberLoading[projectId]) {
      return;
    }

    setError(null);
    setMemberNotice((prev) => ({
      ...prev,
      [projectId]: { type: "success", message: "" },
    }));
    setMemberLoading((prev) => ({ ...prev, [projectId]: true }));

    try {
      const response = await addProjectMember(projectId, { username });
      setMembersByProject((prev) => ({
        ...prev,
        [projectId]: response.members,
      }));
      setMemberInputs((prev) => ({ ...prev, [projectId]: "" }));
      setMemberNotice((prev) => ({
        ...prev,
        [projectId]: {
          type: "success",
          message: response.message || "Member added successfully",
        },
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to add member";
      setMemberNotice((prev) => ({
        ...prev,
        [projectId]: { type: "error", message },
      }));
    } finally {
      setMemberLoading((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  const handleRemoveMember = async (projectId: string, userId: string) => {
    setError(null);
    try {
      const response = await removeProjectMember(projectId, userId);
      setMembersByProject((prev) => ({
        ...prev,
        [projectId]: response.members,
      }));
      setMemberNotice((prev) => ({
        ...prev,
        [projectId]: { type: "success", message: "Member removed" },
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to remove member";
      setMemberNotice((prev) => ({
        ...prev,
        [projectId]: { type: "error", message },
      }));
    }
  };

  return (
    <RequireAuth>
      <AppShell>
        <div className="stack">
          <div>
            <div className="section-title">Projects</div>
            <div className="muted">
              Admins can manage project details and membership.
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          {loading ? (
            <div className="page-loader">Loading projects...</div>
          ) : (
            <div className="stack">
              {role === "Admin" && (
                <div className="card">
                  <div className="card-title">Create project</div>
                  <div className="form-grid" style={{ marginTop: "12px" }}>
                    <div className="form-row">
                      <label className="label" htmlFor="projectName">
                        Project name
                      </label>
                      <input
                        id="projectName"
                        className="input"
                        value={newProject.name}
                        onChange={(event) =>
                          setNewProject((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label className="label" htmlFor="projectDescription">
                        Description
                      </label>
                      <textarea
                        id="projectDescription"
                        className="textarea"
                        value={newProject.description}
                        onChange={(event) =>
                          setNewProject((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateProject}
                    >
                      Create project
                    </button>
                  </div>
                </div>
              )}
              <div className="list">
                {projects.map((project) => (
                  <div key={project.id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{project.name}</div>
                        <div className="muted">{project.description}</div>
                      </div>
                      {role === "Admin" && (
                        <div className="button-row">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingProjectId(project.id);
                              setEditProject({
                                name: project.name,
                                description: project.description,
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingProjectId === project.id && role === "Admin" && (
                      <div className="form-grid" style={{ marginTop: "12px" }}>
                        <div className="form-row">
                          <label className="label">Project name</label>
                          <input
                            className="input"
                            value={editProject.name}
                            onChange={(event) =>
                              setEditProject((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="form-row">
                          <label className="label">Description</label>
                          <textarea
                            className="textarea"
                            value={editProject.description}
                            onChange={(event) =>
                              setEditProject((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="button-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleUpdateProject(project.id)}
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setEditingProjectId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {role === "Admin" && (
                      <div className="stack" style={{ marginTop: "16px" }}>
                        <div className="divider" />
                        <div>
                          <div className="card-title">Project members</div>
                          <div className="muted">
                            Add or remove users assigned to this project.
                          </div>
                        </div>
                        <div className="button-row">
                          <input
                            className="input"
                            placeholder="Enter username"
                            value={memberInputs[project.id] || ""}
                            onChange={(event) =>
                              setMemberInputs((prev) => ({
                                ...prev,
                                [project.id]: event.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleAddMember(project.id)}
                            disabled={
                              memberLoading[project.id] ||
                              !(memberInputs[project.id] || "").trim()
                            }
                          >
                            {memberLoading[project.id]
                              ? "Adding..."
                              : "Add member"}
                          </button>
                        </div>
                        <div className="muted">
                          Try usernames: rahul, priya, sneha, arjun
                        </div>
                        {memberNotice[project.id]?.message && (
                          <div
                            className={
                              memberNotice[project.id].type === "error"
                                ? "error-text"
                                : "muted"
                            }
                          >
                            {memberNotice[project.id].message}
                          </div>
                        )}
                        <div className="list">
                          {(membersByProject[project.id] || []).map((member) => (
                            <div key={member.id} className="card">
                              <div className="card-header">
                                <div>
                                  <div className="card-title">
                                    {member.username}
                                  </div>
                                  <div className="muted">{member.role}</div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={() =>
                                    handleRemoveMember(project.id, member.user_id)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
