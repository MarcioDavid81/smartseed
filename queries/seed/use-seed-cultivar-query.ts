import { getSeedCultivars } from "@/services/seed/seedCultivar";
import { Cultivar } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useSeedCultivarQuery() {
  return useQuery<Cultivar[]>({
    queryKey: ["seed-cultivar"],
    queryFn: () => getSeedCultivars(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}