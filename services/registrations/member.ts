import { Member } from "@/types";
import { apiFetch } from "../api";
import { MemberFormData } from "@/lib/schemas/memberSchema";

export async function getMembers(): Promise<Member[]> {
  const data = await apiFetch<Member[]>(
    `/api/members`
  );

  return data;
}

export async function getMember(memberId: string): Promise<Member> {
  const data = await apiFetch<Member>(
    `/api/members/${memberId}`
  );

  return data;
}

type UpsertMemberParams = {
  data: MemberFormData;
  memberId?: string;
};

export function upsertMember({
  data,
  memberId,
}: UpsertMemberParams) {
  const url = memberId
    ? `/api/members/${memberId}`
    : "/api/members";

  const method = memberId ? "PUT" : "POST";

  return apiFetch<Member>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}