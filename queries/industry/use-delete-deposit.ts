import { useSmartToast } from "@/contexts/ToastContext";
import { deleteIndustryDeposit } from "@/services/industry/industryDeposit";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteIndustryDeposit() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();
  
  return useMutation({
    mutationFn: (industryDepositId: string) => deleteIndustryDeposit(industryDepositId),
    mutationKey: ["industry-deposit"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Depósito excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industry-deposit"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir depósito.",
      });
    },
  });
}