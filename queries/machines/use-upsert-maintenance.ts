import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertMaintenance } from "@/services/machines/maintenance";
import { MaintenanceFormData } from "@/lib/schemas/maintenanceSchema";
import { Maintenance } from "@/types";

type Params = {
  maintenanceId?: string
};

export function useUpsertMaintenance({ maintenanceId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaintenanceFormData) =>
      upsertMaintenance({
        data,
        maintenanceId,
      }),

    onSuccess: (savedMaintenance) => {
      queryClient.setQueryData<Maintenance[]>(
        ["maintenances"],
        (old) => {
          if (!old) return [savedMaintenance];

          if (maintenanceId) {
            return old.map((r) =>
              r.id === savedMaintenance.id ? savedMaintenance : r,
            );
          }

          return [savedMaintenance, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["maintenances"],
      });
    },
  });
}
