import { AppUser } from "@/types";
import { apiFetch } from "../api";
import { CreateUserInput } from "@/lib/schemas/userSchema";

export async function getUsers(): Promise<AppUser[]> {
  const data = await apiFetch<AppUser[]>(
    "/api/auth/register"
  );
  return data;
}

type UpsertUserParams = {
  data: CreateUserInput;
  userId?: string;
};

export function upsertUser({
  data,
  userId,
}: UpsertUserParams) {
  const url = userId
    ? `/api/auth/register/${userId}`
    : "/api/auth/register";

  const method = userId ? "PUT" : "POST";

  return apiFetch<AppUser>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteUser(userId: string) {
  return apiFetch<AppUser>(`/api/auth/register/${userId}`, {
    method: "DELETE",
  });
}