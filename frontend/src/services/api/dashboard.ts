import { request } from "./client";

export type DashboardStats = {
  totalTasks: number;
  tasksByStatus: {
    Todo: number;
    "In Progress": number;
    Completed: number;
  };
  overdueTasks: number;
  completedTasks: number;
  assignedTasks: number;
};

export const getDashboard = async () => {
  return request<{ stats: DashboardStats }>("/dashboard");
};
