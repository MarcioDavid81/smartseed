import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

type AuthPayload = {
  userId: string;
  companyId: string;
};

type RequireAuthResult =
  | { ok: true } & AuthPayload
  | { ok: false; response: NextResponse };

export async function requireAuth(
  req: Request,
): Promise<RequireAuthResult> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            title: "Token ausente",
            message:
              "O token de autorização é necessário para acessar este recurso.",
          },
        },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = await verifyToken(token);

  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            title: "Token inválido",
            message:
              "O token fornecido é inválido ou expirou. Faça login novamente.",
          },
        },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    ...payload,
  };
}
