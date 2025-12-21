import { useSmartToast } from "@/contexts/ToastContext";
import { deleteIndustryAdjustStock } from "@/services/industry/industryAdjustmentStock";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteStockAdjust() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (industryAdjustId: string) => deleteIndustryAdjustStock(industryAdjustId),
    mutationKey: ["industry-adjust"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Ajuste de estoque excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industry-adjust"],
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