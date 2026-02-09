import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";
import { upsertIndustrySale } from "@/services/industry/industrySale";
import { IndustrySale } from "@/types";

type Params = {
  saleId?: string;
  depositId?: string;
};

export function useUpsertIndustrySale({ saleId, depositId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustrySaleFormData) =>
      upsertIndustrySale({
        data,
        saleId,
      }),

    onSuccess: (savedSale) => {
      queryClient.setQueryData<IndustrySale[]>(
        ["industrySales"],
        (old) => {
          if (!old) return [savedSale];

          if (saleId) {
            return old.map((s) =>
              s.id === savedSale.id ? savedSale : s,
            );
          }

          return [savedSale, ...old];
        },
      );
      
      queryClient.invalidateQueries({
        queryKey: ["industrySales"],
      });
      queryClient.invalidateQueries({
        queryKey: ["industry-deposit", depositId],
      });
      queryClient.invalidateQueries({
        queryKey: ["industry-stock"],
      });
    },
  });
}
