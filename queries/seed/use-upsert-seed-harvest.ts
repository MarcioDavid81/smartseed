import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Harvest } from "@/types";
import { SeedHarvestFormData } from "@/lib/schemas/seedHarvestSchema";
import { upsertSeedHarvest } from "@/services/seed/seedHarvest";

type Params = {
  cycleId: string;
  harvestId?: string;
};

export function useUpsertSeedHarvest({ cycleId, harvestId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeedHarvestFormData) =>
      upsertSeedHarvest({
        data,
        cycleId,
        harvestId,
      }),
    onSuccess: (savedHarvest) => {
      queryClient.setQueryData<Harvest[]>(
        ["seed-harvest", cycleId],
        (old) => {
          if (!old) return [savedHarvest];

          if (harvestId) {
            return old.map((h) =>
              h.id === savedHarvest.id ? savedHarvest : h,
            );
          }

          return [savedHarvest, ...old];
        },
      );
      
      queryClient.invalidateQueries({
        queryKey: ["seed-harvest", cycleId],
      });
    },
  });
}