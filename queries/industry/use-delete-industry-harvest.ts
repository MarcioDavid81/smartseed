import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteIndustryHarvest } from "@/services/industry/industryHarvest";

type Params = {
  cycleId: string;
};

export function useDeleteIndustryHarvest({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (harvestId: string) => deleteIndustryHarvest(harvestId),
    mutationKey: ["industryHarvests", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Colheita excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["industryHarvests", cycleId],
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
