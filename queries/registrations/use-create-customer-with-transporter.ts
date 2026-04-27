"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerFormData } from "@/lib/schemas/customerSchema";
import { createCustomerWithTransporter } from "@/services/registrations/customer-with-transporter";

type Input = {
  customer: CustomerFormData;
  alsoTransporter?: boolean;
};

export function useCreateCustomerWithTransporter() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: Input) => {
      return await createCustomerWithTransporter(input);
    },

    onSuccess: () => {
      // 🔥 invalida listas que podem ter sido afetadas
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["industry-transporter"] });
    },
  });

  return {
    createCustomerWithTransporter: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}