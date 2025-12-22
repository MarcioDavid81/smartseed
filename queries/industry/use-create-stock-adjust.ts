import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustryAdjustStockFormData } from "@/lib/schemas/industryAdjustStockSchema";
import { createIndustryAdjustStock } from "@/services/industry/industryAdjustmentStock";
import { IndustryAdjustStock } from "@/types";

export function useCreateStockAdjust() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustryAdjustStockFormData) =>
      createIndustryAdjustStock({
        data,
      }),

    onSuccess: (savedIndustryAdjust) => {
      queryClient.setQueryData<IndustryAdjustStock[]>(
        ["industry-adjust"],
        (old) => {
          if (!old) return [savedIndustryAdjust];

          return [savedIndustryAdjust, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["industry-stock"],
      });
    },
  });
}
