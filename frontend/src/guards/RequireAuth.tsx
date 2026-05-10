"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "../auth/authStorage";

type RequireAuthProps = {
  allowedRoles?: Array<"Admin" | "Member">;
  children: React.ReactNode;
};

export default function RequireAuth({
  allowedRoles,
  children,
}: RequireAuthProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
      router.replace("/dashboard");
      return;
    }

    setReady(true);
  }, [allowedRoles, router]);

  if (!ready) {
    return <div className="page-loader">Loading...</div>;
  }

  return <>{children}</>;
}
