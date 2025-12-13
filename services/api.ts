import { getToken } from "@/lib/auth-client";

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const token = getToken();

  const res = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error("Erro na requisição");
  }

  return res.json();
}
