import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustryTransporter } from "@/types";
import { upsertIndustryTransporter } from "@/services/industry/industryTransporter";
import { IndustryTransporterFormData } from "@/lib/schemas/industryTransporter";

type Params = {
  transporterId?: string;
};

export function useUpsertIndustryTransporter({ transporterId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustryTransporterFormData) =>
      upsertIndustryTransporter({
        data,
        transporterId,
      }),

    onSuccess: (savedTransporter) => {
      queryClient.setQueryData<IndustryTransporter[]>(
        ["industry-transporter"],
        (old) => {
          if (!old) return [savedTransporter];

          if (transporterId) {
            return old.map((t) =>
              t.id === savedTransporter.id ? savedTransporter : t,
            );
          }

          return [savedTransporter, ...old];
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["industry-transporter"],
      });
    },
  });
}
