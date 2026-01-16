import { useSmartToast } from "@/contexts/ToastContext";
import { RainFormData } from "@/lib/schemas/rainSchema";
import { deleteRain, getRains, upsertRain } from "@/services/industry/rain";
import { Rain } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useRains() {
  return useQuery({
    queryKey: ["rains"],
    queryFn: () => getRains(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  rainId?: string;
};

export function useUpsertRain({ rainId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RainFormData) =>
      upsertRain({
        data,
        rainId,
      }),

    onSuccess: (savedRain) => {
      queryClient.setQueryData<Rain[]>(
        ["rain"],
        (old) => {
          if (!old) return [savedRain];

          if (rainId) {
            return old.map((t) =>
              t.id === savedRain.id ? savedRain : t,
            );
          }

          return [savedRain, ...old];
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["rains"],
      });
    },
  });
}

export function useDeleteRain() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (rainId: string) => deleteRain(rainId),
    mutationKey: ["rains"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Chuva excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["rains"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir chuva.",
      });
    },
  });
}

