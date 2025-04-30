import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authMiddleware(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string; companyId: string };

    // Adiciona os dados do usuário à requisição
    (req as any).user = decoded;
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
  }
}
