import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { Customer } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import { CustomerFormData, customerSchema } from "@/lib/schemas/customerSchema";
import { useUpsertCustomer } from "@/queries/registrations/use-customer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InputMask from "react-input-mask";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddress } from "@/queries/adress/use-adress";

interface UpsertCustomerModalProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertCustomerModal = ({
  customer,
  isOpen,
  onClose,
}: UpsertCustomerModalProps) => {
  const [personType, setPersonType] = useState<"fisica" | "juridica">("fisica");
  const { showToast } = useSmartToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      adress: customer?.adress ?? "",
      city: customer?.city ?? "",
      state: customer?.state ?? "",
      phone: customer?.phone ?? "",
      cpf_cnpj: customer?.cpf_cnpj ?? "",
    },
  });

useEffect(() => {
  if (customer) {
    form.reset({
      name: customer.name,
      email: customer.email,
      adress: customer.adress,
      city: customer.city,
      state: customer.state,
      phone: customer.phone,
      cpf_cnpj: customer.cpf_cnpj,
    });

    const onlyNumbers = customer.cpf_cnpj?.replace(/\D/g, "") || "";

    setPersonType(onlyNumbers.length === 14 ? "juridica" : "fisica");
  } else {
    form.reset();
    setPersonType("fisica");
  }
}, [customer, isOpen]);

const { states, cities, isLoadingCities } = useAddress({
  isOpen,
  form,
  stateField: "state",
  cityField: "city",
});

  const { mutate, isPending } = useUpsertCustomer({
    customerId: customer?.id,
  })

  const onSubmit = async (data: CustomerFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso!",
          message: customer
            ? "Cliente atualizado com sucesso!"
            : "Cliente cadastrado com sucesso!",
        });
        onClose();
        form.reset();
      },
      onError: (error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || "Ocorreu um erro ao salvar o cliente. Por favor, tente novamente.",
        });
      },
    });
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Clientes</DialogTitle>
          <DialogDescription>
            {customer ? "Editar cliente" : "Cadastrar cliente"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Agro Campo LTDA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="comercial@agrocampo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="adress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Rua dos Campos, 123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select
                        value={form.watch("state")}
                        onValueChange={(value) => form.setValue("state", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.sigla}>
                              {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Select
                        value={form.watch("city")}
                        onValueChange={(value) => form.setValue("city", value)}
                        disabled={!form.watch("state") || isLoadingCities}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.nome}>
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="(99) 99999-9999"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            placeholder="Telefone"
                            type="text"
                          />
                        )}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div>
              <FormItem>
                <FormLabel>Tipo de pessoa</FormLabel>
                <RadioGroup
                  value={personType}
                  onValueChange={(value) => {
                    setPersonType(value as "fisica" | "juridica");
                    form.setValue("cpf_cnpj", ""); // limpa ao trocar
                  }}
                  className="flex gap-4"
                >
                  <FormItem className="flex items-center gap-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <FormLabel htmlFor="fisica">Pessoa Física</FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <FormLabel htmlFor="juridica">Pessoa Jurídica</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
              </div>
              <div>
              <FormField
                control={form.control}
                name="cpf_cnpj"
                render={({ field }) => {
                  const isJuridica = personType === "juridica";

                  return (
                    <FormItem>
                      <FormLabel>{isJuridica ? "CNPJ" : "CPF"}</FormLabel>
                      <FormControl>
                        <InputMask
                          mask={
                            isJuridica
                              ? "99.999.999/9999-99"
                              : "999.999.999-99"
                          }
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder={isJuridica ? "CNPJ" : "CPF"}
                              type="text"
                            />
                          )}
                        </InputMask>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <Button
              disabled={isPending}
              type="submit"
              className="w-full bg-green text-white"
              >
              {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertCustomerModal;
