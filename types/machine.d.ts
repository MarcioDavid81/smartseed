import { Maintenance, Refuel } from "@prisma/client";

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  brand?: string;
  model?: string;
  plate?: string;
  serialNumber?: string;
  houmeter?: number;
  odometer?: number;
  maintenance?: Maintenance[];
  refuel?: Refuel[];
}