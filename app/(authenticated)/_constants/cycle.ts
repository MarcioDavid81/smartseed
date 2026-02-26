import { CycleStatus } from "@prisma/client";

export const CYCLE_STATUS_LABELS = {
  OPEN: "Aberta",
  CLOSED: "Fechada",
};

export const CYCLE_STATUS_OPTIONS = [
    {
        value: CycleStatus.OPEN,
        label: CYCLE_STATUS_LABELS.OPEN
    },
    {
        value: CycleStatus.CLOSED,
        label: CYCLE_STATUS_LABELS.CLOSED
    },
]