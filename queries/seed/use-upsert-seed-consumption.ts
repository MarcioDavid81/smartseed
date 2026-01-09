import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Consumption } from "@/types";
import { ConsumptionFormData } from "@/lib/schemas/seedConsumption";
import { upsertConsumption } from "@/services/seed/seedConsumption";

type Params = {
  cycleId: string;
  consumptionId?: string;
};

export function useUpsertSeedConsumption({ cycleId, consumptionId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConsumptionFormData) =>
      upsertConsumption({
        data,
        cycleId,
        consumptionId,
      }),
    onSuccess: (savedConsumption) => {
      queryClient.setQueryData<Consumption[]>(
        ["seed-consumption", cycleId],
        (old) => {
          if (!old) return [savedConsumption];

          if (consumptionId) {
            return old.map((b) =>
              b.id === savedConsumption.id ? savedConsumption : b,
            );
          }

          return [savedConsumption, ...old];
        },
      );
      
      queryClient.invalidateQueries({
        queryKey: ["seed-consumption", cycleId],
      });
    },
  });
}