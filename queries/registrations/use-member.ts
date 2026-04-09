import { Member } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers, getMember, upsertMember } from "@/services/registrations/member";
import { MemberFormData } from "@/lib/schemas/memberSchema";

export function useMembers() {
  return useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: () => getMembers(),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 1 semana
  });
}

export function useMember(memberId: string) {
  return useQuery<Member>({
    queryKey: ["members", memberId],
    queryFn: () => getMember(memberId),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 1 semana
  })
}

type Params = {
  memberId?: string;
};

export function useUpsertMember({ memberId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MemberFormData) =>
      upsertMember({
        data,
        memberId,
      }),

    onSuccess: (savedMember) => {
      queryClient.setQueryData<Member[]>(
        ["members"],
        (old) => {
          if (!old) return [savedMember];

          if (memberId) {
            return old.map((c) =>
              c.id === savedMember.id ? savedMember : c,
            );
          }

          return [savedMember, ...old];
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
    },
  });
}