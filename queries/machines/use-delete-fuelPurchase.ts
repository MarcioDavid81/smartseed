import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteFuelPurchase } from "@/services/machines/fuelPurchase";


export function useDeleteFuelPurchase() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (fuelPurchaseId: string) => deleteFuelPurchase(fuelPurchaseId),
    mutationKey: ["fuelPurchases"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Compra de combustível excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["fuelPurchases"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir compra de combustível.",
      });
    },
  });
}
