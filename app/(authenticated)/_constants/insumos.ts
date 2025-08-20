import { ProductClass, Unit } from "@prisma/client"

export const PRODUCT_CLASS_LABELS = {
    ADUBO_DE_BASE: "Adubo de Base",
    ADUBO_DE_COBERTURA: "Adubo de Cobertura",
    HERBICIDA: "Herbicida",
    INSETICIDA: "Inseticida",
    FUNGICIDA: "Fungicida",
    OLEO_MINERAL: "Óleo Mineral",
    ADJUVANTE: "Adjuvante",
    CORRETIVO: "Corretivo",
    OUTROS: "Outros"
}

export const PRODUCT_CLASS_OPTIONS = [
    {
        value: ProductClass.ADJUVANTE,
        label: PRODUCT_CLASS_LABELS.ADJUVANTE
    },
    {
        value: ProductClass.ADUBO_DE_BASE,
        label: PRODUCT_CLASS_LABELS.ADUBO_DE_BASE
    },
    {
        value: ProductClass.ADUBO_DE_COBERTURA,
        label: PRODUCT_CLASS_LABELS.ADUBO_DE_COBERTURA
    },
    {
        value: ProductClass.HERBICIDA,
        label: PRODUCT_CLASS_LABELS.HERBICIDA
    },
    {
        value: ProductClass.INSETICIDA,
        label: PRODUCT_CLASS_LABELS.INSETICIDA
    },
    {
        value: ProductClass.FUNGICIDA,
        label: PRODUCT_CLASS_LABELS.FUNGICIDA
    },
    {
        value: ProductClass.OLEO_MINERAL,
        label: PRODUCT_CLASS_LABELS.OLEO_MINERAL
    },
    {
        value: ProductClass.CORRETIVO,
        label: PRODUCT_CLASS_LABELS.CORRETIVO
    },
    {
        value: ProductClass.OUTROS,
        label: PRODUCT_CLASS_LABELS.OUTROS
    }
]

export const PRODUCT_UNIT_LABELS = {
    KG: "Kilograma",
    GR: "Grama",
    L: "Litro",
    ML: "Mililitro",
    SC: "Saco",
    UN: "Unidade",
    CX: "Caixa"
}

export const PRODUCT_UNIT_OPTIONS = [
    {
        value: Unit.KG,
        label: PRODUCT_UNIT_LABELS.KG
    },
    {
        value: Unit.GR,
        label: PRODUCT_UNIT_LABELS.GR
    },
    {
        value: Unit.L,
        label: PRODUCT_UNIT_LABELS.L
    },
    {
        value: Unit.ML,
        label: PRODUCT_UNIT_LABELS.ML
    },
    {
        value: Unit.SC,
        label: PRODUCT_UNIT_LABELS.SC
    },
    {
        value: Unit.UN,
        label: PRODUCT_UNIT_LABELS.UN
    },
    {
        value: Unit.CX,
        label: PRODUCT_UNIT_LABELS.CX
    }
]
