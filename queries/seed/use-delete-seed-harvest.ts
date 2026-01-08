import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteSeedHarvest } from "@/services/seed/seedHarvest";

type Params = {
  cycleId: string;
};

export function useDeleteSeedHarvest({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (harvestId: string) => deleteSeedHarvest(harvestId),
    mutationKey: ["seed-harvest", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Colheita excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["seed-harvest", cycleId],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir colheita.",
      });
    },
  });
}
