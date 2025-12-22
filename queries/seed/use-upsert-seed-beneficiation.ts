import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BeneficiationFormData } from "@/lib/schemas/seedBeneficiationSchema";
import { upsertBeneficiation } from "@/services/seed/seedBeneficiation";
import { Beneficiation } from "@/types";

type Params = {
  cycleId: string;
  beneficiationId?: string;
};

export function useUpsertSeedBeneficiation({ cycleId, beneficiationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BeneficiationFormData) =>
      upsertBeneficiation({
        data,
        cycleId,
        beneficiationId,
      }),
    onSuccess: (savedBeneficiation) => {
      queryClient.setQueryData<Beneficiation[]>(
        ["seed-beneficiation", cycleId],
        (old) => {
          if (!old) return [savedBeneficiation];

          if (beneficiationId) {
            return old.map((b) =>
              b.id === savedBeneficiation.id ? savedBeneficiation : b,
            );
          }

          return [savedBeneficiation, ...old];
        },
      );
      
      queryClient.invalidateQueries({
        queryKey: ["seed-beneficiation", cycleId],
      });
    },
  });
}