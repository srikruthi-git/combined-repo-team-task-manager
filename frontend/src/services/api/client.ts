import { getAuth } from "../../auth/authStorage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export const request = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth) {
    const auth = getAuth();
    if (auth?.token) {
      headers.set("Authorization", `Bearer ${auth.token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }

  return data as T;
};
