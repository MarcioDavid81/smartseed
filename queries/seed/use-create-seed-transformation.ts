import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transformation } from "@/types";
import { SeedTransformationFormData } from "@/lib/schemas/transformation";
import { createSeedTransformation } from "@/services/seed/seedTransformation";


export function useCreateSeedTransformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeedTransformationFormData) =>
      createSeedTransformation({
        data,
      }),

      onSuccess: (savedSeedTransformation) => {
        queryClient.setQueryData<Transformation[]>(
          ["transformation"],
          (old) => {
            if (!old) return [savedSeedTransformation];
  
            return [savedSeedTransformation, ...old];
          },
        );
        queryClient.invalidateQueries({
          queryKey: ["transformation"],
        });
      },
  });
}