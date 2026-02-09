import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { SaleContractDetails } from "@/types";

export async function getSaleContractByIdServerSide(
  id: string,
): Promise<SaleContractDetails> {
  const token = cookies().get("token")?.value;
  if (!token) throw new Error("UNAUTHORIZED");

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) throw new Error("HOST_NOT_FOUND");

  const res = await fetch(
    `${proto}://${host}/api/commercial/sale-contracts/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("FAILED_TO_FETCH_SALE_CONTRACT");

  return res.json();
}
