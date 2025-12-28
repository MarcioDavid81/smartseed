import { getToken } from "@/lib/auth-client";
import { ApiError } from "@/lib/http/api-error";


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
  let code: string | undefined;

  try {
    const body = await res.json();

    if (body?.message) {
      message = body.message;
    }

    if (body?.error) {
      code =
        typeof body.error === "string"
          ? body.error
          : body.error.code;
    }

    if (body?.error) {
        message = body.error.message ?? message;
        code = body.error.code;
      }
  } catch {}

  throw new ApiError(message, res.status, code);
}

  return res.json();
}
