import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteFuelTank } from "@/services/machines/fuelTank";


export function useDeleteFuelTank() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (fuelTankId: string) => deleteFuelTank(fuelTankId),
    mutationKey: ["fuelTanks"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Tanque de combustível excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["fuelTanks"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir tanque de combustível.",
      });
    },
  });
}
