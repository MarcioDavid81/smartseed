import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sale } from "@/types";
import { SeedSaleFormData } from "@/lib/schemas/seedSaleSchema";
import { upsertSeedSale } from "@/services/seed/seedSale";

type Params = {
  cycleId: string;
  saleId?: string;
};

export function useUpsertSeedSale({ cycleId, saleId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeedSaleFormData) =>
      upsertSeedSale({
        data,
        cycleId,
        saleId,
      }),
    onSuccess: (savedSale) => {
      queryClient.setQueryData<Sale[]>(
        ["seed-sale", cycleId],
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
        queryKey: ["seed-sale", cycleId],
      });
    },
  });
}