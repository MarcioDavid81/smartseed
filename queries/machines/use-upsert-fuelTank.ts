import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertMachine } from "@/services/machines/machines";
import { MachineFormData } from "@/lib/schemas/machineSchema";
import { FuelTankFormData } from "@/lib/schemas/fuelTankSchema";
import { upsertFuelTank } from "@/services/machines/fuelTank";

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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fuelTanks"],
      });
    },
  });
}
