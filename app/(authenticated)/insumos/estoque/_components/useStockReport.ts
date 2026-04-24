import { InputStock } from "@/types";
import { useMemo } from "react";

export function useStockReport(stocks: InputStock[]) {
  return useMemo(() => {
    const produtos = Array.from(new Set(stocks.map((s) => s.product.name)));
    const classes = Array.from(new Set(stocks.map((s) => s.product.class)));
    const depositos = Array.from(
      new Set(stocks.map((s) => s.farm.name))
    );

    return {
      produtos,
      classes,
      depositos,
    };
  }, [stocks]);
}

export function useFilteredStock(
  stocks: InputStock[],
  product: string | null,
  farm: string | null
) {
  return useMemo(() => {
    return stocks.filter((c) => {
      const matchProduct = !product || c.product.name === product;
      const matchClass = !product || c.product.class === product;
      const matchFarm =
        !farm || c.farm.name === farm;

      return matchProduct && matchClass && matchFarm;
    });
  }, [stocks, product, farm]);
}