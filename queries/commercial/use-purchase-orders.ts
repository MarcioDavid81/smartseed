import { PurchaseOrder } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deletePurchaseOrder, getPurchaseOrders, upsertPurchaseOrder } from "@/services/commercial/purchaseOrders";
import { PurchaseOrderFormData } from "@/lib/schemas/purchaseOrderSchema";

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => getPurchaseOrders(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  purchaseOrderId?: string;
};

export function useUpsertPurchaseOrder({ purchaseOrderId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseOrderFormData) =>
      upsertPurchaseOrder({
        data,
        purchaseOrderId,
      }),

    onSuccess: (savedPurchaseOrder) => {
      queryClient.setQueryData<PurchaseOrder[]>(
        ["purchase-orders"],
        (old) => {
          if (!old) return [savedPurchaseOrder];

          if (purchaseOrderId) {
            return old.map((f) =>
              f.id === savedPurchaseOrder.id ? savedPurchaseOrder : f,
            );
          }

          return [savedPurchaseOrder, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (purchaseOrderId: string) => deletePurchaseOrder(purchaseOrderId),
    mutationKey: ["purchase-orders"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Ordem de compra excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir ordem de compra.",
      });
    },
  });
}
