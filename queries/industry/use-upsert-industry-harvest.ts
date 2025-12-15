import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustryHarvestFormData } from "@/lib/schemas/industryHarvest";
import { upsertIndustryHarvest } from "@/services/industry/industryHarvest";
import { IndustryHarvest } from "@/types";

type Params = {
  cycleId: string;
  harvestId?: string;
};

export function useUpsertIndustryHarvest({ cycleId, harvestId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustryHarvestFormData) =>
      upsertIndustryHarvest({
        data,
        cycleId,
        harvestId,
      }),

    onSuccess: (savedHarvest) => {
      queryClient.setQueryData<IndustryHarvest[]>(
        ["industryHarvests", cycleId],
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
        queryKey: ["industryHarvests", cycleId],
      });
    },
  });
}
