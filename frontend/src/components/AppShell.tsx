"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getAuth, type AuthUser } from "../auth/authStorage";

type AppShellProps = {
  children: React.ReactNode;
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth?.user ?? null);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-title">Team Task Manager</div>
          <div className="brand-subtitle">
            Keep projects moving with clear ownership.
          </div>
        </div>
        <nav className="nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-meta">
          {user && (
              <span className="badge">
                {user.role} - {user.username}
              </span>
          )}
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="stack">{children}</main>
    </div>
  );
}
