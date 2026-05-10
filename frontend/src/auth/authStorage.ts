export type AuthUser = {
  id: string;
  username: string;
  role: "Admin" | "Member";
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
};

const STORAGE_KEY = "ttm_auth";

export const saveAuth = (payload: AuthPayload) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const getAuth = (): AuthPayload | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
};
