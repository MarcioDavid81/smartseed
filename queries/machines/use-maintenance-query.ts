import { getMaintenance } from "@/services/machines/maintenance";
import { useQuery } from "@tanstack/react-query";

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenances"],
    queryFn: () => getMaintenance(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}
