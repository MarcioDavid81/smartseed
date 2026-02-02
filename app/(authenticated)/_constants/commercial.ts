import { ComercialStatus, PurchaseOrderType, SaleContractType, Unit } from "@prisma/client";

export const PURCHASE_TYPE_LABELS = {
  SEED_PURCHASE: "Compra de Semente",
  INPUT_PURCHASE: "Compra de Insumo",
};

export const PURCHASE_TYPE_OPTIONS = [
    {
        value: PurchaseOrderType.SEED_PURCHASE,
        label: PURCHASE_TYPE_LABELS.SEED_PURCHASE
    },
    {
        value: PurchaseOrderType.INPUT_PURCHASE,
        label: PURCHASE_TYPE_LABELS.INPUT_PURCHASE
    },
]

export const SALE_TYPE_LABELS = {
  SEED_SALE: "Venda de Semente",
  INDUSTRY_SALE: "Venda de Indústria",
}

export const SALE_TYPE_OPTIONS = [
  {
    value: SaleContractType.SEED_SALE,
    label: SALE_TYPE_LABELS.SEED_SALE
  },
  {
    value: SaleContractType.INDUSTRY_SALE,
    label: SALE_TYPE_LABELS.INDUSTRY_SALE
  },
]

export const UNIT_TYPE_LABELS = {
  KG: "Kg",
  GR: "Gr",
  L: "Lt",
  ML: "Ml",
  SC: "Sc",
  UN: "Un",
  CX: "Cx",
  TN: "Tn",
}

export const UNIT_TYPE_OPTIONS = [
  {
    value: Unit.CX,
    label: UNIT_TYPE_LABELS.CX,
  },
  {
    value: Unit.GR,
    label: UNIT_TYPE_LABELS.GR,
  },
  {
    value: Unit.KG,
    label: UNIT_TYPE_LABELS.KG,
  },
  {
    value: Unit.L,
    label: UNIT_TYPE_LABELS.L,
  },
  {
    value: Unit.ML,
    label: UNIT_TYPE_LABELS.ML,
  },
  {
    value: Unit.SC,
    label: UNIT_TYPE_LABELS.SC,
  },
  {
    value: Unit.UN,
    label: UNIT_TYPE_LABELS.UN,
  },
  {
    value: Unit.TN,
    label: UNIT_TYPE_LABELS.TN,
  },
]

export const COMMERCIAL_STATUS_TYPE_LABELS = {
  OPEN: "ABERTO",
  PARTIAL_FULFILLED: "PARCIALMENTE ENTREGUE",
  FULFILLED: "ENTREGUE",
  CANCELED: "CANCELADO",
}

export const COMMERCIAL_STATUS_TYPE_OPTIONS = [
  {
    value: ComercialStatus.OPEN,
    label: COMMERCIAL_STATUS_TYPE_LABELS.OPEN,
  },
  {
    value: ComercialStatus.PARTIAL_FULFILLED,
    label: COMMERCIAL_STATUS_TYPE_LABELS.PARTIAL_FULFILLED,
  },
  {
    value: ComercialStatus.FULFILLED,
    label: COMMERCIAL_STATUS_TYPE_LABELS.FULFILLED,
  },
  {
    value: ComercialStatus.CANCELED,
    label: COMMERCIAL_STATUS_TYPE_LABELS.CANCELED,
  },
]
