import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";
import { upsertIndustrySale } from "@/services/industry/industrySale";
import { IndustrySale } from "@/types";

type Params = {
  cycleId: string;
  saleId?: string;
};

export function useUpsertIndustrySale({ cycleId, saleId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustrySaleFormData) =>
      upsertIndustrySale({
        data,
        cycleId,
        saleId,
      }),

    onSuccess: (savedSale) => {
      queryClient.setQueryData<IndustrySale[]>(
        ["industrySales", cycleId],
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
        queryKey: ["industrySales", cycleId],
      });
    },
  });
}
