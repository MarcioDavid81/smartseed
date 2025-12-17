import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertRefuel } from "@/services/machines/refuel";
import { RefuelFormData } from "@/lib/schemas/refuelSchema";
import { Refuel } from "@/types";

type Params = {
  refuelId?: string;
};

export function useUpsertRefuel({ refuelId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefuelFormData) =>
      upsertRefuel({
        data,
        refuelId,
      }),

    onSuccess: (savedRefuel) => {
      queryClient.setQueryData<Refuel[]>(
        ["refuels"],
        (old) => {
          if (!old) return [savedRefuel];

          if (refuelId) {
            return old.map((r) =>
              r.id === savedRefuel.id ? savedRefuel : r,
            );
          }

          return [savedRefuel, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["refuels"],
      });
      queryClient.invalidateQueries({
        queryKey: ["machines-dashboard"],
        refetchType: "active",
      });
    },
  });
}
