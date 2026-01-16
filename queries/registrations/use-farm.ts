import { FarmFormData } from "@/lib/schemas/farmSchema";
import { deleteFarm, getFarms, upsertFarm } from "@/services/registrations/farm";
import { Farm } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";

export function useFarms() {
  return useQuery({
    queryKey: ["farms"],
    queryFn: () => getFarms(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  farmId?: string;
};

export function useUpsertFarm({ farmId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FarmFormData) =>
      upsertFarm({
        data,
      }),

    onSuccess: (savedFarm) => {
      queryClient.setQueryData<Farm[]>(
        ["farms"],
        (old) => {
          if (!old) return [savedFarm];

          if (farmId) {
            return old.map((f) =>
              f.id === savedFarm.id ? savedFarm : f,
            );
          }

          return [savedFarm, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["farms"],
      });
    },
  });
}

export function useDeleteFarm() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (farmId: string) => deleteFarm(farmId),
    mutationKey: ["farms"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Fazenda excluída com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["farms"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir fazenda.",
      });
    },
  });
}
