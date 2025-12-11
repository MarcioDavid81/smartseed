export const tipoMovimentacaoInfo: Record<
  string,
  { label: string; entrada: boolean }
> = {
  COLHEITA: { label: "Colheita", entrada: true },
  COMPRA: { label: "Compra", entrada: true },
  TRANSFERENCIA_POSITIVA: { label: "Transferência +", entrada: true },
  DESCARTE: { label: "Descarte", entrada: false },
  PLANTIO: { label: "Plantio", entrada: false },
  VENDA: { label: "Venda", entrada: false },
  TRANSFERENCIA_NEGATIVA: { label: "Transferência -", entrada: false },
};