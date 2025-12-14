import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustryHarvestFormData } from "@/lib/schemas/industryHarvest";
import { upsertIndustryHarvest } from "@/services/industry/industryHarvest";

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

    onSuccess: () => {
      // 🔄 invalida a listagem de colheitas
      queryClient.invalidateQueries({
        queryKey: ["industryHarvests", cycleId],
      });
    },
  });
}
