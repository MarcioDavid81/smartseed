import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./prisma";

export function getJwtSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
      throw new Error("JWT_SECRET não definido nas variáveis de ambiente.");
    }
    return new TextEncoder().encode(secret);
  }

  type JWTPayload = {
    userId: string;
    companyId: string;
    // Você pode adicionar outros campos conforme necessário
  };
  
  export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
  
      if (typeof payload.userId === "string" && typeof payload.companyId === "string") {
        return {
          userId: payload.userId,
          companyId: payload.companyId,
        };
      }
  
      return null;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return null;
    }
  }

  export async function getUserFromToken() {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
  
    if (!token) return null;
  
    const payload = await verifyToken(token);
  
    if (!payload) return null;
  
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });
  
    return user;
  }

  export async function getCompanyFromToken() {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
  
    if (!token) return null;
  
    const payload = await verifyToken(token);
  
    if (!payload) return null;
  
    const company = await db.company.findUnique({
      where: { id: payload.companyId },
      select: {
        id: true,
        name: true,
        plan: true,
      },
    });
  
    return company;
  }

  export async function getCompanyPlan() {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
  
    if (!token) return null;
  
    try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const companyId = payload.companyId;

    if (!companyId || typeof companyId !== "string") return null;

    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { plan: true },
    });

    return company?.plan ?? null;
  } catch (error) {
    console.error("Erro ao verificar plano da empresa:", error);
    return null;
  }
  }
  