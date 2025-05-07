import { db } from "@/lib/prisma";


type TipoMovimentacao = "colheita" | "compra" | "venda" | "plantio" | "descarte";

/**
 * Ajusta o estoque da cultivar ao deletar uma movimentação.
 * 
 * @param tipo Tipo da movimentação (colheita, compra, venda, plantio, descarte)
 * @param cultivarId ID da cultivar
 * @param quantidade Quantidade em kg a ajustar
 */
export async function adjustStockWhenDeleteMov(
  tipo: TipoMovimentacao,
  cultivarId: string,
  quantidade: number
) {
  // Entrada → Incrementar o estoque ao deletar
  const movimentacoesDeEntrada: TipoMovimentacao[] = ["colheita", "compra"];

  const operacao = movimentacoesDeEntrada.includes(tipo)
    ? "decrement"
    : "increment";

  await db.cultivar.update({
    where: { id: cultivarId },
    data: {
      stock: {
        [operacao]: quantidade,
      },
    },
  });
}
