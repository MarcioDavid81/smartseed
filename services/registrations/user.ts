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
  avatar?: File | null;
  userId?: string;
};

export function upsertUser({ data, userId }: UpsertUserParams) {
  const url = userId
    ? `/api/auth/register/${userId}`
    : "/api/auth/register";

  const method = userId ? "PUT" : "POST";

  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("email", data.email);

  if (data.password) {
    formData.append("password", data.password);
  }

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  return apiFetch<AppUser>(url, {
    method,
    body: formData,
  });
}

export function deleteUser(userId: string) {
  return apiFetch<AppUser>(`/api/auth/register/${userId}`, {
    method: "DELETE",
  });
}