import { request } from "./client";

export type Project = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  added_at: string;
  username: string;
  role: string;
};

export const listProjects = async () => {
  return request<{ projects: Project[] }>("/projects");
};

export const createProject = async (payload: {
  name: string;
  description?: string;
}) => {
  return request<{ project: Project }>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateProject = async (
  projectId: string,
  payload: { name: string; description?: string }
) => {
  return request<{ project: Project }>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteProject = async (projectId: string) => {
  return request<{ message: string }>(`/projects/${projectId}`, {
    method: "DELETE",
  });
};

export const listProjectMembers = async (projectId: string) => {
  return request<{ members: ProjectMember[] }>(
    `/projects/${projectId}/members`
  );
};

export const addProjectMember = async (
  projectId: string,
  payload: { username?: string; userId?: string }
) => {
  return request<{ members: ProjectMember[]; message?: string }>(
    `/projects/${projectId}/members`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const removeProjectMember = async (
  projectId: string,
  memberId: string
) => {
  return request<{ members: ProjectMember[] }>(
    `/projects/${projectId}/members/${memberId}`,
    {
      method: "DELETE",
    }
  );
};
