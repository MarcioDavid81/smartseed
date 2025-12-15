import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertMachine } from "@/services/machines/machines";
import { MachineFormData } from "@/lib/schemas/machineSchema";
import { Machine } from "@/types";

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

    onSuccess: (savedMachine) => {
      queryClient.setQueryData<Machine[]>(
        ["machines"],
        (old) => {
          if (!old) return [savedMachine];

          if (machineId) {
            return old.map((m) =>
              m.id === savedMachine.id ? savedMachine : m,
            );
          }

          return [savedMachine, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["machines"],
      });
    },
  });
}
