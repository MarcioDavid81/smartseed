import { Maintenance, Refuel } from "@prisma/client";

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  brand?: string;
  model?: string;
  plate?: string;
  serialNumber?: string;
  hourmeter?: number;
  odometer?: number;
  maintenance?: Maintenance[];
  refuel?: Refuel[];
}