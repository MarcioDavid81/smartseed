import { IndustryDepositFormData } from "@/lib/schemas/industryDepositSchema";
import { upsertIndustryDeposit } from "@/services/industry/industryDeposit";
import { IndustryDeposit } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Params = {
  depositId?: string;
};

export function useUpsertIndustryDeposit({ depositId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustryDepositFormData) =>
      upsertIndustryDeposit({
        data,
        depositId,
      }),

    onSuccess: (savedDeposit) => {
      queryClient.setQueryData<IndustryDeposit[]>(
        ["industry-deposit"],
        (old) => {
          if (!old) return [savedDeposit];

          if (depositId) {
            return old.map((t) =>
              t.id === savedDeposit.id ? savedDeposit : t,
            );
          }

          return [savedDeposit, ...old];
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["industry-deposit"],
      });
    },
  });
}
