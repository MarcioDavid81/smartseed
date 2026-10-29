import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCycle } from "../../services/cycle/cycle";
import { useSmartToast } from "@/contexts/ToastContext";

type Params = {
  cycleId: string;
};

export function useDeleteCycle({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: () => deleteCycle(cycleId),
    mutationKey: ["deleteCycle", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Safra excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["cycles"],
      });
    },
    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir safra.",
      });
    },
  });
}
