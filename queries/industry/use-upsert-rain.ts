import { RainFormData } from "@/lib/schemas/rainSchema";
import { upsertRain } from "@/services/industry/rain";
import { Rain } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
        queryKey: ["rain"],
      });
    },
  });
}
