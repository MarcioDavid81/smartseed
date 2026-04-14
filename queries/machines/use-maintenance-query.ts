import { getMaintenance, getMaintenanceById } from "@/services/machines/maintenance";
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

export function useMaintenanceById(maintenanceId: string) {
  return useQuery({
    queryKey: ["maintenances", maintenanceId],
    queryFn: () => getMaintenanceById(maintenanceId),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}