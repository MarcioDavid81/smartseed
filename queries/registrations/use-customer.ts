import { Customer } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSmartToast } from "@/contexts/ToastContext";
import { deleteCustomer, getCustomers, upsertCustomer } from "@/services/registrations/customer";
import { CustomerFormData } from "@/lib/schemas/customerSchema";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(),
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

type Params = {
  customerId?: string;
};

export function useUpsertCustomer({ customerId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerFormData) =>
      upsertCustomer({
        data,
      }),

    onSuccess: (savedCustomer) => {
      queryClient.setQueryData<Customer[]>(
        ["customers"],
        (old) => {
          if (!old) return [savedCustomer];

          if (customerId) {
            return old.map((c) =>
              c.id === savedCustomer.id ? savedCustomer : c,
            );
          }

          return [savedCustomer, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { showToast } = useSmartToast();

  return useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId),
    mutationKey: ["customers"],
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Cliente excluído com sucesso!",
      });

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },

    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Erro",
        message: error.message || "Erro ao excluir cliente.",
      });
    },
  });
}
