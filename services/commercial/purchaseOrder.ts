import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { PurchaseOrderDetails } from "@/types";

export async function getPurchaseOrderByIdServerSide(
  id: string,
): Promise<PurchaseOrderDetails> {
  const token = cookies().get("token")?.value;
  if (!token) throw new Error("UNAUTHORIZED");

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) throw new Error("HOST_NOT_FOUND");

  const res = await fetch(
    `${proto}://${host}/api/commercial/purchase-orders/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("FAILED_TO_FETCH_PURCHASE_ORDER");

  return res.json();
}
