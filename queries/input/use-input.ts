import { useSmartToast } from "@/contexts/ToastContext";
import { InputProductFormData } from "@/lib/schemas/inputSchema";
import { deleteInputProduct, getInputProducts, upsertInputProduct } from "@/services/input/inputProduct";
import { Insumo } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInputProductQuery() {
  return useQuery<Insumo[]>({
    queryKey: ["input-product"],
    queryFn: () => getInputProducts(),
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
  });
}

type Params = {
  inputProductId?: string;
};

export function useUpsertInputProduct({ inputProductId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputProductFormData) =>
      upsertInputProduct({
        data,
        productId: inputProductId,
      }),



    onSuccess: (savedInputProduct) => {
      queryClient.setQueryData<Insumo[]>(
        ["input-product"],
        (old) => {
          if (!old) return [savedInputProduct];

          if (inputProductId) {
            return old.map((f) =>
              f.id === savedInputProduct.id ? savedInputProduct : f,
            );
          }

          return [savedInputProduct, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["input-product"],
      });
    },
  });
}

export function useDeleteInputProduct() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (inputProductId: string) => deleteInputProduct(inputProductId),
    mutationKey: ["input-product"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Insumo excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["input-product"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir insumo.",
      });
    },
  });
}
