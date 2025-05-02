import { jwtVerify } from "jose";

export function getJwtSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
      throw new Error("JWT_SECRET não definido nas variáveis de ambiente.");
    }
    return new TextEncoder().encode(secret);
  }

  export async function verifyToken(token: string): Promise<string | null> {
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
  
      // Supondo que o payload do token inclua o userId
      return typeof payload.userId === "string" ? payload.userId : null;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return null;
    }
  }