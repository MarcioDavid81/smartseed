import { ProductType } from "@prisma/client";

export interface Cultivar {
  id: string;
  name: string;
  product: ProductType;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CultivarFormData {
  name: string;
  product: ProductType;
}
