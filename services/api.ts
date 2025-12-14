import { getToken } from "@/lib/auth-client";

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const token = getToken();

  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = "Erro na requisição";

    try {
      const body = await res.json();
      message = body?.error ?? message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}
