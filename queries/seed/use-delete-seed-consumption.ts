import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteConsumption } from "@/services/seed/seedConsumption";

type Params = {
  cycleId: string;
};

export function useDeleteSeedConsumption({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (consumptionId: string) => deleteConsumption(consumptionId),
    mutationKey: ["seed-consumption", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Plantio excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["seed-consumption", cycleId],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir plantio.",
      });
    },
  });
}
