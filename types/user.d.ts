export interface AppUser {
    id: string;
    name: string;
    email: string;
    companyId: string;
    imageUrl: string;
    role: "ADMIN" | "USER";
  }
  