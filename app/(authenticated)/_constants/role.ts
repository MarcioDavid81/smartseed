import { Role } from "@prisma/client";

export const ROLE_LABELS = {
  ADMIN: "Administrador",
  USER: "Usuário comum",
};

export const ROLE_OPTIONS = [
    {
        value: Role.ADMIN,
        label: ROLE_LABELS.ADMIN
    },
    {
        value: Role.USER,
        label: ROLE_LABELS.USER
    },
]