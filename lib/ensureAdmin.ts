export function ensureAdmin(user: any) {
  if (!user || user.role !== "ADMIN") {
    throw new Error("Acesso não autorizado");
  }
}
