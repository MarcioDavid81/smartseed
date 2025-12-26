export interface HarvestRomaneioPDF {
  id: string;
  date: Date;

  company: {
    name: string;
  };

  origin: {
    farm: string;
    talhao: string;
  };

  destination: {
    deposit: string;
  };

  logistics: {
    transporter: string;
    truckPlate?: string;
    driver?: string;
  };

  weights: {
    bruto: number;
    tara: number;
    subLiquido: number;
    liquido: number;
  };

  discounts: {
    humidityPercent: number;
    humidityKg: number;
    impuritiesPercent: number;
    impuritiesKg: number;
    taxKg?: number;
    adjustKg?: number;
  };

  document?: string;
}
