import { getToken } from "@/lib/auth-client";

type ApiErrorBody = {
  error?: {
    code?: string;
    title?: string;
    message?: string;
  };
};

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const token = getToken();

  const isFormData = init?.body instanceof FormData;

  const res = await fetch(input, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = "Erro na requisição";

    try {
      const body = await res.json();

      if (body?.error?.message) {
        message = body.error.message;
      } else if (typeof body?.error === "string") {
        message = body.error;
      }
    } catch {}

    throw new Error(message);
  }

  return res.json();
}
