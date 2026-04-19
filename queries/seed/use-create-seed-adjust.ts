import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SeedAdjustStock as SeedAdjustStockFormData } from "@/lib/schemas/seedAdjustStockSchema";
import { createSeedAdjustStock } from "@/services/seed/seedAdjustmentStock";
import { SeedAdjustStock } from "@/types";

type Params = {
  cycleId: string;
}

export function useCreateSeedAdjust({ cycleId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeedAdjustStockFormData) => {
      return createSeedAdjustStock({
        data,
        cycleId,
      });
    },

      onSuccess: (savedSeedAdjust) => {
        queryClient.setQueryData<SeedAdjustStock[]>(
          ["seed-adjust", cycleId],
          (old) => {
            if (!old) return [savedSeedAdjust];
  
            return [savedSeedAdjust, ...old];
          },
        );
        queryClient.invalidateQueries({
          queryKey: ["seed-adjust", cycleId],
        });
      },
  });
}