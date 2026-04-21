import { IndustryStock } from "@/types";
import { useMemo } from "react";

export function useStockReport(stocks: IndustryStock[]) {
  return useMemo(() => {
    const produtos = Array.from(new Set(stocks.map((s) => s.product)));
    const depositos = Array.from(
      new Set(stocks.map((s) => s.industryDeposit.name))
    );

    return {
      produtos,
      depositos,
    };
  }, [stocks]);
}

export function useFilteredStock(
  stocks: IndustryStock[],
  product: string | null,
  deposit: string | null
) {
  return useMemo(() => {
    return stocks.filter((c) => {
      const matchProduct = !product || c.product === product;
      const matchDeposit =
        !deposit || c.industryDeposit.name === deposit;

      return matchProduct && matchDeposit;
    });
  }, [stocks, product, deposit]);
}