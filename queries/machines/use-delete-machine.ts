import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteMachine } from "@/services/machines/machines";


export function useDeleteMachine() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (machineId: string) => deleteMachine(machineId),

    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Máquina excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["machines"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir máquina.",
      });
    },
  });
}
