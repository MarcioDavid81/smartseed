import { useSmartToast } from "@/contexts/ToastContext";
import { deleteSeedAdjustStock } from "@/services/seed/seedAdjustmentStock";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSeedAdjust() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (seedAdjustId: string) => deleteSeedAdjustStock(seedAdjustId),
    mutationKey: ["seed-adjust"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Ajuste de estoque excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["seed-adjust"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir ajuste de estoque.",
      });
    },
  });
}
