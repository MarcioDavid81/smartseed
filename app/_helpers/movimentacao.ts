type MovimentacaoDirectionType = "entrada" | "saida" | "dinamica";

export const tipoMovimentacaoInfo: Record<
  string,
  { label: string; direction: MovimentacaoDirectionType }
> = {
  COLHEITA: { label: "Colheita", direction: "entrada" },
  COMPRA: { label: "Compra", direction: "entrada" },
  TRANSFERENCIA_POSITIVA: { label: "Transferência +", direction: "entrada" },

  DESCARTE: { label: "Descarte", direction: "saida" },
  PLANTIO: { label: "Plantio", direction: "saida" },
  VENDA: { label: "Venda", direction: "saida" },
  TRANSFERENCIA_NEGATIVA: { label: "Transferência -", direction: "saida" },
  TRANSFORMACAO: { label: "Transformação", direction: "saida" },

  AJUSTE: { label: "Ajuste", direction: "dinamica" },
};
