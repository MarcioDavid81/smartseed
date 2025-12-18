import { tipoMovimentacaoInfo } from "./movimentacao";

export function getMovimentacaoDirection(
  tipo: string,
  quantidade: number,
): "entrada" | "saida" {
  const info = tipoMovimentacaoInfo[tipo.toUpperCase()];

  if (!info) return "entrada";

  if (info.direction === "dinamica") {
    return quantidade >= 0 ? "entrada" : "saida";
  }

  return info.direction;
}
