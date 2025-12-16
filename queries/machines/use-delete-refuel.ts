import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteRefuel } from "@/services/machines/refuel";


export function useDeleteRefuel() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (refuelId: string) => deleteRefuel(refuelId),
    mutationKey: ["refuels"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "abastecimento excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["refuels"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir abastecimento.",
      });
    },
  });
}
