import { Plan } from "@prisma/client";

export interface Company {
  id: string;
  name: string;
  plan?: Plan | null;
}
