"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../services/api/auth";
import { getAuth, saveAuth } from "../../auth/authStorage";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = await login(username, password);
      saveAuth(payload);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="stack">
        <div className="brand">
          <div className="brand-title">Team Task Manager</div>
          <div className="brand-subtitle">
            Sign in with the demo roles to explore the platform.
          </div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Welcome back</div>
                <div className="muted">Use a demo account to continue.</div>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className="input"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
              <div className="form-row">
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
              {error && <div className="error-text">{error}</div>}
              <div className="button-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setUsername("admin");
                    setPassword("admin123");
                  }}
                >
                  Login as Admin
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setUsername("member");
                    setPassword("member123");
                  }}
                >
                  Login as Member
                </button>
              </div>
            </form>
          </div>
          <div className="info-card stack">
            <div>
              <strong>Demo Admin Account</strong>
              <ul className="credential-list" style={{ marginTop: "8px" }}>
                <li>Username: admin</li>
                <li>Password: admin123</li>
              </ul>
            </div>
            <div className="divider" />
            <div>
              <strong>Demo Member Account</strong>
              <ul className="credential-list" style={{ marginTop: "8px" }}>
                <li>Username: member</li>
                <li>Password: member123</li>
              </ul>
            </div>
            <div className="divider" />
            <div>These are temporary demo credentials for evaluation purposes.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
