import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteSeedSale } from "@/services/seed/seedSale";

type Params = {
  cycleId: string;
};

export function useDeleteSeedSale({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (saleId: string) => deleteSeedSale(saleId),
    mutationKey: ["seed-sale", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Venda excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["seed-sale", cycleId],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir venda.",
      });
    },
  });
}
