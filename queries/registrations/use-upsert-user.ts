import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppUser } from "@/types";
import { CreateUserInput } from "@/lib/schemas/userSchema";
import { upsertUser } from "@/services/registrations/user";

type Params = {
  userId?: string;
};

export function useUpsertUser({ userId }: Params) {
  const queryClient = useQueryClient();

  return useMutation<AppUser, Error, CreateUserInput>({
    mutationFn: (data) =>
      upsertUser({
        data,
        userId,
      }),

    onSuccess: (savedUser) => {
      queryClient.setQueryData<AppUser[]>(
        ["users"],
        (old) => {
          if (!old) return [savedUser];

          if (userId) {
            return old.map((u) =>
              u.id === savedUser.id ? savedUser : u
            );
          }

          return [savedUser, ...old];
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}

