import { UserRole } from "@/types";
import { Permission, rolePermissions } from "../rbac";


export function canUser(role: UserRole, permission: Permission) {
  return rolePermissions[role]?.includes(permission);
}
