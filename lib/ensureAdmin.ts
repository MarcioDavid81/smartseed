import { Role } from "@prisma/client";

export function ensureAdmin(user: any) {
  if (!user || user.role !== Role.ADMIN) {
    throw new Error("Acesso não autorizado");
  }
}
