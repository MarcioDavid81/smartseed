import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteUser } from "@/services/registrations/user";

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    mutationKey: ["users"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Usuário excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir usuário.",
      });
    },
  });
}
