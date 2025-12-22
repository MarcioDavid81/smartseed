import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteBeneficiation } from "@/services/seed/seedBeneficiation";

type Params = {
  cycleId: string;
};

export function useDeleteSeedBeneficiation({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (beneficiationId: string) => deleteBeneficiation(beneficiationId),
    mutationKey: ["seed-beneficiation", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Descarte excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["seed-beneficiation", cycleId],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir descarte.",
      });
    },
  });
}
