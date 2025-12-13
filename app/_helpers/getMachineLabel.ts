import { MACHINE_TYPE_OPTIONS } from "../(authenticated)/_constants/machines";

export function getMachineTypeLabel(value: string) {
  return MACHINE_TYPE_OPTIONS.find(opt => opt.value === value)?.label ?? value;
}