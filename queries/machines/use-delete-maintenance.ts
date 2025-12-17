import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteMaintenance } from "@/services/machines/maintenance";


export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (maintenanceId: string) => deleteMaintenance(maintenanceId),
    mutationKey: ["maintenances"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Manutenção excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["maintenances"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir manutenção.",
      });
    },
  });
}
