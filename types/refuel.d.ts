export interface Refuel {
  id: string;
  date: Date;
  quantity: number;
  tankId: string;
  tank: {
    id: string;
    name: string;
  };
  machineId: string;
  machine: {
    id: string;
    name: string;
  };
  hourmeter?: number;
  odometer?: number;
  createdAt: Date;
}