import { ProductClass, Unit } from "@prisma/client";

export interface InputStock {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    class: ProductClass;
    unit: Unit;
  }
  farmId: string;
  farm: {
    id: string;
    name: string;
  }
  stock: number;
}