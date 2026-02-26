import { changeCycleStatus } from "@/services/registrations/cycle";
import { CycleStatus } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Params = {
  cycleId: string;
};

export function useChangeCycleStatus({ cycleId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: CycleStatus) => changeCycleStatus({ cycleId, status }),
    mutationKey: ["cycle-status", cycleId],
    onSuccess: (status) => {
      queryClient.setQueryData<CycleStatus>(["cycle-status", cycleId], status);
      queryClient.invalidateQueries({ queryKey: ["cycle", cycleId] });
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
  });
}