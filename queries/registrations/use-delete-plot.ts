import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deletePlot } from "@/services/registrations/plot";


export function useDeletePlot() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (plotId: string) => deletePlot(plotId),
    mutationKey: ["plots"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Talhão excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["plots"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir talhão.",
      });
    },
  });
}
