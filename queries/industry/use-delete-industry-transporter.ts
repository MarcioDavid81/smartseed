import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
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
        message: "Transportador excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industry-transporter"],
      });
    },

    onError: (error: ApiError) => {
      if (error.code === "TRANSPORTER_HAS_SALES") {
        showToast({
          type: "error",
          title: "Vendas associadas",
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