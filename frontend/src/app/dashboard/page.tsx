"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../guards/RequireAuth";
import AppShell from "../../components/AppShell";
import { getDashboard, type DashboardStats } from "../../services/api/dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDashboard();
        setStats(response.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load stats");
      }
    };

    loadStats();
  }, []);

  return (
    <RequireAuth>
      <AppShell>
        <div className="stack">
          <div>
            <div className="section-title">Dashboard overview</div>
            <div className="muted">
              Track task delivery and workload at a glance.
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          {!stats ? (
            <div className="page-loader">Loading dashboard...</div>
          ) : (
            <>
              <div className="grid-3">
                <div className="card">
                  <div className="card-title">Total tasks</div>
                  <h2>{stats.totalTasks}</h2>
                  <div className="muted">Across active projects</div>
                </div>
                <div className="card">
                  <div className="card-title">Assigned tasks</div>
                  <h2>{stats.assignedTasks}</h2>
                  <div className="muted">Currently owned work</div>
                </div>
                <div className="card">
                  <div className="card-title">Overdue tasks</div>
                  <h2>{stats.overdueTasks}</h2>
                  <div className="muted">Past due date</div>
                </div>
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="card-title">Tasks by status</div>
                  <div className="stack" style={{ marginTop: "12px" }}>
                    <div className="button-row">
                      <span className="status-pill">
                        Todo: {stats.tasksByStatus.Todo}
                      </span>
                      <span className="status-pill">
                        In Progress: {stats.tasksByStatus["In Progress"]}
                      </span>
                      <span className="status-pill">
                        Completed: {stats.tasksByStatus.Completed}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Completed tasks</div>
                  <h2>{stats.completedTasks}</h2>
                  <div className="muted">Delivered outcomes</div>
                </div>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
