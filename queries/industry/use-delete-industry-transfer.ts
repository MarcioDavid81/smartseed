import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import { deleteIndustryTransporter } from "@/services/industry/industryTransporter";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteIndustryTransfer() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (industryTransferId: string) => deleteIndustryTransporter(industryTransferId),
    mutationKey: ["industry-transfer"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Transferência excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industry-transfer"],
      });
    },

    onError: (error: ApiError) => {
      if (error.code === "INSUFFICIENT_STOCK") {
        showToast({
          type: "error",
          title: "Estoque insuficiente",
          message: error.message,
        });
        return;
      }
      if (error.code === "TRANSPORTER_HAS_HARVESTS") {
        showToast({
          type: "error",
          title: "Colheitas associadas",
          message: error.message,
        });
        return;
      }
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir transportador.",
      });
    },
  });
}