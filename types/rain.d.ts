export interface Rain {
  id: string;
  date: Date;
  quantity: number;
  farmId: string;
  farm: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}