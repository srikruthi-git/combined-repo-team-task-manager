import { request } from "./client";

export type User = {
  id: string;
  username: string;
  role: "Admin" | "Member";
};

export const listUsers = async () => {
  return request<{ users: User[] }>("/users");
};
