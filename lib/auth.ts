import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { db } from "./prisma";
import { AppUser } from "@/types";
import { Role } from "@prisma/client";

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
  role: string;
};

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    if (
      typeof payload.userId === "string" &&
      typeof payload.companyId === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        userId: payload.userId,
        companyId: payload.companyId,
        role: payload.role,
      };
    }

    return null;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}

export async function getUserFromToken() {
  // 1️⃣ cookie
  const cookieToken = cookies().get("token")?.value;

  // 2️⃣ authorization header
  const authHeader = headers().get("authorization");
  const headerToken =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

  const token = cookieToken || headerToken;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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

export async function getAuthUserOrThrow() {
  const user = await getUserFromToken();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function requireAdmin(user: any) {
  if (user.role !== Role.ADMIN) {
    throw new Error("FORBIDDEN");
  }
}

