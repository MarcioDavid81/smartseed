import { SaleContract, SaleContractDetails } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteSaleContract, getSaleContractById, getSaleContracts, upsertSaleContract } from "@/services/commercial/saleContracts";
import { SaleContractFormData } from "@/lib/schemas/saleContractSchema";

export function useSaleContracts() {
  return useQuery<SaleContractDetails[]>({
    queryKey: ["sale-contracts"],
    queryFn: () => getSaleContracts(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

export function useSaleContractById(saleContractId: string) {
  return useQuery({
    queryKey: ["sale-contracts", saleContractId],
    queryFn: () => getSaleContractById(saleContractId),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  saleContractId?: string;
};

export function useUpsertSaleContract({ saleContractId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaleContractFormData) =>
      upsertSaleContract({
        data,
        saleContractId,
      }),

    onSuccess: (savedSaleContract) => {
      queryClient.setQueryData<SaleContract[]>(
        ["sale-contracts"],
        (old) => {
          if (!old) return [savedSaleContract];

          if (saleContractId) {
            return old.map((f) =>
              f.id === savedSaleContract.id ? savedSaleContract : f,
            );
          }

          return [savedSaleContract, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["sale-contracts"],
      });
    },
  });
}

export function useDeleteSaleContract() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (saleContractId: string) => deleteSaleContract(saleContractId),
    mutationKey: ["sale-contracts"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Contrato de venda excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["sale-contracts"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir contrato de venda.",
      });
    },
  });
}
