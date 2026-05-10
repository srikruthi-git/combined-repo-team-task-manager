import { request } from "./client";
import type { AuthPayload } from "../../auth/authStorage";

export const login = async (username: string, password: string) => {
  return request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
};
