import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";
import { upsertIndustrySale } from "@/services/industry/industrySale";
import { IndustrySale, IndustryTransfer } from "@/types";
import { CreateIndustryTransferFormData } from "@/lib/schemas/industryTransferSchema";
import { upsertIndustryTransfer } from "@/services/industry/industryTransfer";

type Params = {
  transferId?: string;
};

export function useUpsertIndustryTransfer({ transferId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIndustryTransferFormData) =>
      upsertIndustryTransfer({
        data,
        transferId,
      }),

    onSuccess: (savedSale) => {
      queryClient.setQueryData<IndustryTransfer[]>(
        ["industry-transfer"],
        (old) => {
          if (!old) return [savedSale];

          if (transferId) {
            return old.map((s) =>
              s.id === savedSale.id ? savedSale : s,
            );
          }

          return [savedSale, ...old];
        },
      );
      
      queryClient.invalidateQueries({
        queryKey: ["industry-transfer"],
      });
    },
  });
}
