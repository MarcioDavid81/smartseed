import { MachineType } from "@prisma/client"

export const MACHINE_TYPE_LABELS = {
  TRACTOR: "Trator",
  COMBINE: "Colheitadeira",
  SPRAYER: "Pulverizador",
  TRUCK: "Caminhão",
  PICKUP: "Caminhonete",
  IMPLEMENT: "Implemento",
  OTHER: "Outros",
}

export const MACHINE_TYPE_OPTIONS = [
  {
    value: MachineType.TRACTOR,
    label: MACHINE_TYPE_LABELS.TRACTOR
  },
  {
    value: MachineType.COMBINE,
    label: MACHINE_TYPE_LABELS.COMBINE
  },
  {
    value: MachineType.SPRAYER,
    label: MACHINE_TYPE_LABELS.SPRAYER
  },
  {
    value: MachineType.TRUCK,
    label: MACHINE_TYPE_LABELS.TRUCK
  },
  {
    value: MachineType.PICKUP,
    label: MACHINE_TYPE_LABELS.PICKUP
  },
  {
    value: MachineType.IMPLEMENT,
    label: MACHINE_TYPE_LABELS.IMPLEMENT
  },
  {
    value: MachineType.OTHER,
    label: MACHINE_TYPE_LABELS.OTHER
  },
]