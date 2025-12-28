import { UserRole } from "@/types";


export type Permission =
  | "user:create"
  | "user:delete"
  | "company:manage"
  | "machine:delete"
  | "fuelTank:delete"
  | "fuelPurchase:delete"
  | "refuel:delete"
  | "maintenance:delete"
  | "harvest:delete"
  | "sale:delete"
  | "transport:delete"
  | "user:create"

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "user:create",
    "user:delete",
    "company:manage",
    "machine:delete",
    "fuelTank:delete",
    "fuelPurchase:delete",
    "refuel:delete",
    "maintenance:delete",
    "harvest:delete",
    "sale:delete",
    "transport:delete",
    "user:create",
  ],

  USER: [
    // usuário comum não pode excluir nada crítico
  ],
};
