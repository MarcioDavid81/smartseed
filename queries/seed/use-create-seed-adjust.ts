import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SeedAdjustStock as SeedAdjustStockFormData } from "@/lib/schemas/seedAdjustStockSchema";
import { createSeedAdjustStock } from "@/services/seed/seedAdjustmentStock";
import { SeedAdjustStock } from "@/types";


export function useCreateSeedAdjust() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeedAdjustStockFormData) =>
      createSeedAdjustStock({
        data,
      }),

      onSuccess: (savedSeedAdjust) => {
        queryClient.setQueryData<SeedAdjustStock[]>(
          ["seed-adjust"],
          (old) => {
            if (!old) return [savedSeedAdjust];
  
            return [savedSeedAdjust, ...old];
          },
        );
        queryClient.invalidateQueries({
          queryKey: ["seed-adjust"],
        });
      },
  });
}