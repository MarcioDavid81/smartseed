import { UserRole } from "@/types";


export type Permission =
  | "user:create"
  | "user:delete"
  | "company:manage"
  | "machine:delete"
  | "fuelTank:delete"
  | "harvest:delete"
  | "sale:delete"
  | "transport:delete";

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "user:create",
    "user:delete",
    "company:manage",
    "machine:delete",
    "fuelTank:delete",
    "harvest:delete",
    "sale:delete",
    "transport:delete",
  ],

  USER: [
    // usuário comum não pode excluir nada crítico
  ],
};
