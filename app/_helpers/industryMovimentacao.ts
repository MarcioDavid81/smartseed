export const tipoIndustryMovimentacaoInfo: Record<
  string,
  { label: string; entrada: boolean }
> = {
  COLHEITA: { label: "Colheita", entrada: true },
  TRANSFERENCIA_POSITIVA: { label: "Transferência", entrada: true },
  TRANSFERENCIA_NEGATIVA: { label: "Transferência", entrada: false },
  VENDA: { label: "Venda", entrada: false },
};