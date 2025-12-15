import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteIndustrySale } from "@/services/industry/industrySale";

type Params = {
  cycleId: string;
};

export function useDeleteIndustrySale({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (saleId: string) => deleteIndustrySale(saleId),
    mutationKey: ["industrySales", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Venda excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industrySales", cycleId],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir venda.",
      });
    },
  });
}
