import { Customer, IndustryTransporter } from "@/types";
import { CustomerFormData } from "@/lib/schemas/customerSchema";
import { createCustomer } from "./customer";
import { IndustryTransporterFormData } from "@/lib/schemas/industryTransporter";
import { createTransporter } from "../industry/industryTransporter";

type CreateCustomerWithTransporterInput = {
  customer: CustomerFormData;
  alsoTransporter?: boolean;
};

type CreateCustomerWithTransporterResponse = {
  customer: Customer;
  transporter?: IndustryTransporter;
};

export async function createCustomerWithTransporter(
  input: CreateCustomerWithTransporterInput
): Promise<CreateCustomerWithTransporterResponse> {
  const { customer: customerData, alsoTransporter } = input;

  // 🔹 1. Cria cliente sempre
  const customer = await createCustomer(customerData);

  let transporter: IndustryTransporter | undefined;

  // 🔹 2. Se marcado, cria transportador
  if (alsoTransporter) {
    const transporterPayload: IndustryTransporterFormData = {
      name: customerData.name,
      fantasyName: customerData.fantasyName,
      cpf_cnpj: customerData.cpf_cnpj,
      email: customerData.email,
      phone: customerData.phone,
      adress: customerData.adress,
      city: customerData.city,
      state: customerData.state,
    };

    transporter = await createTransporter(transporterPayload);
  }

  return {
    customer,
    transporter,
  };
}