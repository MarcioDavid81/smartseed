import { useQuery } from "@tanstack/react-query";
import { getMachinesDashboard } from "@/services/machines/get-machines-dashboard";

export function useMachinesDashboard() {
  return useQuery({
    queryKey: ["machines-dashboard"],
    queryFn: getMachinesDashboard,
    refetchOnWindowFocus: true,
  });
}
