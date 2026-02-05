import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Buy } from "@/types";
import { BuyFormData } from "@/lib/schemas/seedBuyScheema";
import { upsertBuy } from "@/services/seed/seedBuy";

type Params = {
  cycleId: string;
  buyId?: string;
  purchaseOrderItemId?: string;
};

export function useUpsertSeedBuy({ cycleId, buyId, purchaseOrderItemId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BuyFormData) =>
      upsertBuy({
        data,
        cycleId,
        buyId,
        purchaseOrderItemId,
      }),
    onSuccess: (savedBuy) => {
      queryClient.setQueryData<Buy[]>(
        ["seed-buy", cycleId],
        (old) => {
          if (!old) return [savedBuy];

          if (buyId) {
            return old.map((b) =>
              b.id === savedBuy.id ? savedBuy : b,
            );
          }

          return [savedBuy, ...old];
        },
      );
      
      queryClient.invalidateQueries({
        queryKey: ["seed-buy", cycleId],
      });
    },
  });
}