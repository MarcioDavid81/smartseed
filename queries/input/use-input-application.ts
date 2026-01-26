import { useSmartToast } from "@/contexts/ToastContext";
import { InputApplicationFormData } from "@/lib/schemas/inputSchema";
import { deleteInputApplication, getInputApplicationsByCycle, upsertInputApplication } from "@/services/input/inputAplication";
import { Application } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInputApplicationsQuery(cycleId?: string) {
  return useQuery<Application[]>({
    queryKey: ["input-applications", cycleId],
    queryFn: () => getInputApplicationsByCycle(cycleId!),
    enabled: !!cycleId,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  cycleId: string;
  applicationId?: string;
};

export function useUpsertInputApplication({ cycleId, applicationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputApplicationFormData) =>
      upsertInputApplication({
        data,
        cycleId,
        applicationId,
      }),

    onSuccess: (savedApplication) => {
      queryClient.setQueryData<Application[]>(
        ["input-applications", cycleId],
        (old) => {
          if (!old) return [savedApplication];

          if (applicationId) {
            return old.map((h) =>
              h.id === savedApplication.id ? savedApplication : h,
            );
          }

          return [savedApplication, ...old];
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["input-applications", cycleId],
      });
    },
  });
}

export function useDeleteInputApplication({ cycleId }: Params) {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (applicationId: string) => deleteInputApplication(applicationId),
    mutationKey: ["input-applications", cycleId],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Aplicação excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["input-applications", cycleId],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir aplicação.",
      });
    },
  });
}