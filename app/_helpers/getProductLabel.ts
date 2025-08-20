import { PRODUCT_TYPE_OPTIONS } from "../(authenticated)/_constants/products";
import { PRODUCT_CLASS_OPTIONS, PRODUCT_UNIT_OPTIONS } from "../(authenticated)/_constants/insumos";

export function getProductLabel(value: string) {
  return PRODUCT_TYPE_OPTIONS.find(opt => opt.value === value)?.label ?? value;
}

export function getProductClassLabel(value: string) {
  return PRODUCT_CLASS_OPTIONS.find(opt => opt.value === value)?.label ?? value;
}

export function getProductUnitLabel(value: string) {
  return PRODUCT_UNIT_OPTIONS.find(opt => opt.value === value)?.label ?? value;
}