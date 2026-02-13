import { getBaseUrl } from "@/app/_helpers/getBaseUrl";
import { cookies } from "next/headers";
import { DashboardOverview } from "../types/dashboard-overview";

type GetDashboardOverviewParams = {
  cycleId?: string;
};

export async function getDashboardOverview(
  params: GetDashboardOverviewParams = {},
): Promise<DashboardOverview> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}/api/dashboard/overview`);

  if (params.cycleId) {
    url.searchParams.set("selectedCycle", params.cycleId);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Failed to fetch dashboard overview";
    throw new Error(message);
  }

  return res.json();
}
