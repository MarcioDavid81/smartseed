import { AccountStatus } from "@prisma/client"

export const ACCOUNT_STATUS_LABELS = {
    PENDING: "Pendente",
    PAID: "Pago",
    OVERDUE: "Atrasado",
    CANCELED: "Cancelado"
}

export const ACCOUNT_STATUS_OPTIONS = [
    {
        value: AccountStatus.PENDING,
        label: ACCOUNT_STATUS_LABELS.PENDING
    },
    {
        value: AccountStatus.PAID,
        label: ACCOUNT_STATUS_LABELS.PAID
    },
    {
        value: AccountStatus.OVERDUE,
        label: ACCOUNT_STATUS_LABELS.OVERDUE
    },
    {
        value: AccountStatus.CANCELED,
        label: ACCOUNT_STATUS_LABELS.CANCELED
    }
]