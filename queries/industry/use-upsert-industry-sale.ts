import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";
import { upsertIndustrySale } from "@/services/industry/industrySale";

type Params = {
  cycleId: string;
  saleId?: string;
};

export function useUpsertIndustrySale({ cycleId, saleId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndustrySaleFormData) =>
      upsertIndustrySale({
        data,
        cycleId,
        saleId,
      }),

    onSuccess: () => {
      // 🔄 invalida a listagem de vendas
      queryClient.invalidateQueries({
        queryKey: ["industrySales", cycleId],
      });
    },
  });
}
