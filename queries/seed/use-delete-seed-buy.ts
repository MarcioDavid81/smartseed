import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteBuy } from "@/services/seed/seedBuy";

type Params = {
  cycleId: string;
};

export function useDeleteSeedBuy({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (buyId: string) => deleteBuy(buyId),
    mutationKey: ["seed-buy", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Compra excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["seed-buy", cycleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir compra.",
      });
    },
  });
}
