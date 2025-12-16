import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FuelTankFormData } from "@/lib/schemas/fuelTankSchema";
import { upsertFuelTank } from "@/services/machines/fuelTank";
import { FuelTank } from "@/types";

type Params = {
  fuelTankId?: string;
};

export function useUpsertFuelTank({ fuelTankId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FuelTankFormData) =>
      upsertFuelTank({
        data,
        fuelTankId,
      }),

    onSuccess: (savedFuelTank) => {
      queryClient.setQueryData<FuelTank[]>(
        ["fuelTanks"],
        (old) => {
          if (!old) return [savedFuelTank];

          if (fuelTankId) {
            return old.map((f) =>
              f.id === savedFuelTank.id ? savedFuelTank : f,
            );
          }

          return [savedFuelTank, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["fuelTanks"],
      });
    },
  });
}
