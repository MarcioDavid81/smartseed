import { PRODUCT_TYPE_OPTIONS } from "../(authenticated)/_constants/products";

export function getProductLabel(value: string) {
  return PRODUCT_TYPE_OPTIONS.find(opt => opt.value === value)?.label ?? value;
}