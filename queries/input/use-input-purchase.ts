import { useSmartToast } from "@/contexts/ToastContext";
import { InputPurchaseFormData } from "@/lib/schemas/inputSchema";
import { deleteInputPurchase, getInputPurchase, upsertInputPurchase } from "@/services/input/inputPurchase";
import { Purchase } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInputPurchaseQuery() {
  return useQuery<Purchase[]>({
    queryKey: ["input-purchase"],
    queryFn: () => getInputPurchase(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  purchaseId?: string;
};

export function useUpsertInputPurchase({ purchaseId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputPurchaseFormData) =>
      upsertInputPurchase({
        data,
        purchaseId,
      }),



    onSuccess: (savedInputPurchase) => {
      queryClient.setQueryData<Purchase[]>(
        ["input-purchase"],
        (old) => {
          if (!old) return [savedInputPurchase];

          if (purchaseId) {
            return old.map((f) =>
              f.id === savedInputPurchase.id ? savedInputPurchase : f,
            );
          }

          return [savedInputPurchase, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["input-purchase"],
      });
    },
  });
}

export function useDeleteInputPurchase() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (purchaseId: string) => deleteInputPurchase(purchaseId),
    mutationKey: ["input-purchase"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Compra de insumo excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["input-purchase"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir compra de insumo.",
      });
    },
  });
}
