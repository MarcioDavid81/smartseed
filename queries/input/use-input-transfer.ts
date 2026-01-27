import { useSmartToast } from "@/contexts/ToastContext";
import { InputTransferFormData } from "@/lib/schemas/inputSchema";
import {
  deleteInputTransfer,
  getInputTransfers,
  upsertInputTransfer,
} from "@/services/input/inputTransfer";
import { Transfer } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInputTransferQuery() {
  return useQuery<Transfer[]>({
    queryKey: ["input-transfer"],
    queryFn: () => getInputTransfers(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  transferId?: string;
};

export function useUpsertInputTransfer({ transferId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputTransferFormData) =>
      upsertInputTransfer({
        data,
        transferId,
      }),

    onSuccess: async (savedInputTransfer) => {
      queryClient.setQueryData<Transfer[]>(["input-transfer"], (old) => {
        if (!old) return [savedInputTransfer];

        if (transferId) {
          return old.map((f) =>
            f.id === savedInputTransfer.id ? savedInputTransfer : f,
          );
        }

        return [savedInputTransfer, ...old];
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["input-transfer"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["input-stock"],
        }),
      ]);
    },
  });
}

export function useDeleteInputTransfer() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (transferId: string) => deleteInputTransfer(transferId),
    mutationKey: ["input-transfer"],
    onSuccess: async () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Transferência de insumo excluída com sucesso!",
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["input-transfer"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["input-stock"],
        }),
      ]);
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir transferência de insumo.",
      });
    },
  });
}
