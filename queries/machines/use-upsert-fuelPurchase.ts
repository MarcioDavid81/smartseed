import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FuelPurchase } from "@/types";
import { FuelPurchaseFormData } from "@/lib/schemas/fuelPurchaseSchema";
import { upsertFuelPurchase } from "@/services/machines/fuelPurchase";

type Params = {
  fuelPurchaseId?: string;
};

export function useUpsertFuelPurchase({ fuelPurchaseId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FuelPurchaseFormData) =>
      upsertFuelPurchase({
        data,
        fuelPurchaseId,
      }),

    onSuccess: (savedFuelPurchase) => {
      queryClient.setQueryData<FuelPurchase[]>(
        ["fuelPurchases"],
        (old) => {
          if (!old) return [savedFuelPurchase];

          if (fuelPurchaseId) {
            return old.map((m) =>
              m.id === savedFuelPurchase.id ? savedFuelPurchase : m,
            );
          }

          return [savedFuelPurchase, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["fuelPurchases"],
      });
    },
  });
}
