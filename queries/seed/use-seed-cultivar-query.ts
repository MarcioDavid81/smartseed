import {
  getSeedCultivarAvailableForSale,
  getSeedCultivars,
  getSeedCultivarById,
  getCultivarStock,
  SeedStockFilters,
} from "@/services/seed/seedCultivar";
import { Cultivar } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useSeedCultivarQuery() {
  return useQuery<Cultivar[]>({
    queryKey: ["seed-cultivar"],
    queryFn: () => getSeedCultivars(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useSeedCultivarAvailableForSaleQuery() {
  return useQuery<Cultivar[]>({
    queryKey: ["seed-cultivar-available-for-sale"],
    queryFn: () => getSeedCultivarAvailableForSale(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useSeedCultivarById(cultivarId?: string) {
  return useQuery<Cultivar>({
    queryKey: ["seed-cultivar", cultivarId],
    queryFn: () => getSeedCultivarById(cultivarId!),
    enabled: Boolean(cultivarId),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useSeedCultivarStockQuery(filters?: SeedStockFilters) {
  return useQuery<Cultivar[]>({
    queryKey: ["seed-cultivar-stock", filters],
    queryFn: () => getCultivarStock(filters!),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
    refetchOnWindowFocus: false,
  });
}