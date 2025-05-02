import { ProductType } from "@prisma/client";

export const PRODUCT_TYPE_LABELS = {
  SOJA: "Soja",
  TRIGO: "Trigo",
  MILHO: "Milho",
  AVEIA_BRANCA: "Aveia Branca",
  AVEIA_PRETA: "Aveia Preta",
  AVEIA_UCRANIANA: "Aveia Ucraniana",
  AZEVEM: "Azevem",
};

export const PRODUCT_TYPE_OPTIONS = [
    {
        value: ProductType.SOJA,
        label: PRODUCT_TYPE_LABELS.SOJA
    },
    {
        value: ProductType.TRIGO,
        label: PRODUCT_TYPE_LABELS.TRIGO
    },
    {
        value: ProductType.MILHO,
        label: PRODUCT_TYPE_LABELS.MILHO
    },
    {
        value: ProductType.AVEIA_BRANCA,
        label: PRODUCT_TYPE_LABELS.AVEIA_BRANCA
    },
    {
        value: ProductType.AVEIA_PRETA,
        label: PRODUCT_TYPE_LABELS.AVEIA_PRETA
    },
    {
        value: ProductType.AVEIA_UCRANIANA,
        label: PRODUCT_TYPE_LABELS.AVEIA_UCRANIANA
    },
    {
        value: ProductType.AZEVEM,
        label: PRODUCT_TYPE_LABELS.AZEVEM
    },
]
