import { getMachineCostsDashboard } from "@/services/machines/get-machine-costs";
import { useQuery } from "@tanstack/react-query";

export function useMachineCosts(machineId?: string) {
  return useQuery({
    queryKey: ["machine-costs", machineId],
    queryFn: () => getMachineCostsDashboard(machineId!),
    enabled: !!machineId,
    staleTime: 0,
  });
}
