import { Role } from "@prisma/client";

export interface AppUser {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    role: Role;
    companyId: string;
    company: {
        id: string;
        name: string;
    }
  }
  