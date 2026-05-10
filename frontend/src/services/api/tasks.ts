import { request } from "./client";

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Completed";
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export const listTasks = async (filters?: {
  projectId?: string;
  status?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.projectId) {
    params.append("projectId", filters.projectId);
  }
  if (filters?.status) {
    params.append("status", filters.status);
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<{ tasks: Task[] }>(`/tasks${suffix}`);
};

export const createTask = async (payload: {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  dueDate?: string | null;
  assignedTo: string;
}) => {
  return request<{ task: Task }>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateTask = async (
  taskId: string,
  payload: {
    title: string;
    description?: string;
    status: string;
    dueDate?: string | null;
    assignedTo: string;
  }
) => {
  return request<{ task: Task }>(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteTask = async (taskId: string) => {
  return request<{ message: string }>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
};

export const updateTaskStatus = async (
  taskId: string,
  status: string
) => {
  return request<{ task: Task }>(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
