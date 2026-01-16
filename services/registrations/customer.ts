import { Customer } from "@/types";
import { apiFetch } from "../api";
import { CustomerFormData } from "@/lib/schemas/customerSchema";

export async function getCustomers(): Promise<Customer[]> {
  const data = await apiFetch<Customer[]>(
    `/api/customers`
  );

  return data;
}

type UpsertFarmParams = {
  data: CustomerFormData;
  customerId?: string;
};

export function upsertCustomer({
  data,
  customerId,
}: UpsertFarmParams) {
  const url = customerId
    ? `/api/customers/${customerId}`
    : "/api/customers";

  const method = customerId ? "PATCH" : "POST";

  return apiFetch<Customer>(url, {
    method,
    body: JSON.stringify({
      ...data,
    }),
  });
}

export function deleteCustomer(customerId: string) {
  return apiFetch<Customer>(`/api/customers/${customerId}`, {
    method: "DELETE",
  });
}