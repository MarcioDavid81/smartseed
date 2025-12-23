import { useSmartToast } from "@/contexts/ToastContext";
import { deleteSeedTransformation } from "@/services/seed/seedTransformation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSeedTransformation() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (seedTransformationId: string) => deleteSeedTransformation(seedTransformationId),
    mutationKey: ["transformation"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Transformação excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["transformation"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir transformação.",
      });
    },
  });
}
