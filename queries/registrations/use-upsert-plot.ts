import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Talhao } from "@/types";
import { PlotFormData } from "@/lib/schemas/plotSchema";
import { upsertPlot } from "@/services/registrations/plot";

type Params = {
  plotId?: string;
};

export function useUpsertPlot({ plotId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlotFormData) =>
      upsertPlot({
        data,
        plotId,
      }),

    onSuccess: (savedPlot) => {
      queryClient.setQueryData<Talhao[]>(
        ["plots"],
        (old) => {
          if (!old) return [savedPlot];

          if (plotId) {
            return old.map((p) =>
              p.id === savedPlot.id ? savedPlot : p,
            );
          }

          return [savedPlot, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["plots"],
      });
    },
  });
}
