import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertMachine } from "@/services/machines/machines";
import { MachineFormData } from "@/lib/schemas/machineSchema";

type Params = {
  machineId?: string;
};

export function useUpsertMachine({ machineId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MachineFormData) =>
      upsertMachine({
        data,
        machineId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["machines"],
      });
    },
  });
}
