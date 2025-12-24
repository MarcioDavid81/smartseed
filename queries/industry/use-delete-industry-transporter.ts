import { useSmartToast } from "@/contexts/ToastContext";
import { deleteIndustryTransporter } from "@/services/industry/industryTransporter";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteIndustryTransporter() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (industryTransporterId: string) => deleteIndustryTransporter(industryTransporterId),
    mutationKey: ["industry-transporter"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Ajuste de estoque excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industry-transporter"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir transportador.",
      });
    },
  });
}