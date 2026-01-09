"use client";

import { MoneyInput, QuantityInput } from "@/components/inputs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { ApiError } from "@/lib/http/api-error";
import { SeedSaleFormData, seedSaleSchema } from "@/lib/schemas/seedSaleSchema";
import { useUpsertSeedSale } from "@/queries/seed/use-upsert-seed-sale";
import { Cultivar } from "@/types";
import { Customer } from "@/types/customers";
import { Sale } from "@/types/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition, ProductType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface UpsertSaleModalProps {
  venda?: Sale;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertSaleModal = ({
  venda,
  isOpen,
  onClose,
}: UpsertSaleModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<SeedSaleFormData>({
    resolver: zodResolver(seedSaleSchema),
    defaultValues: {
      cultivarId: venda?.cultivarId ?? "",
      customerId: venda?.customerId ?? "",
      date: venda ? new Date(venda.date) : new Date(),
      invoiceNumber: venda?.invoiceNumber ?? "",
      saleValue: venda?.saleValue ?? 0,
      quantityKg: venda?.quantityKg ?? 0,
      notes: venda?.notes ?? "",
      paymentCondition: venda?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: venda?.dueDate
        ? new Date(venda.dueDate)
        : new Date(),
    },
  });

  useEffect(() => {
    if (venda) {
      form.reset({
        cultivarId: venda.cultivarId,
        customerId: venda.customerId,
        date: venda ? new Date(venda.date) : new Date(),
        invoiceNumber: venda.invoiceNumber,
        saleValue: venda.saleValue,
        quantityKg: venda.quantityKg,
        notes: venda.notes || "",
        paymentCondition: venda.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: venda?.dueDate
          ? new Date(venda.dueDate)
          : new Date(),
      });
    } else {
      form.reset();
    }
  }, [venda, isOpen, form.reset]);

  useEffect(() => {
    const fetchData = async () => {
      const cycle = getCycle();
      if (!cycle || !cycle.productType) {
        toast.error("Nenhum tipo de produto selecionado.");
        return;
      }

      const token = getToken();

      const [cultivarRes, customerRes] = await Promise.all([
        fetch(`/api/cultivars/available-for-sale?productType=${cycle.productType as ProductType}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const customerData = await customerRes.json();

      setCultivars(cultivarData);
      setCustomers(customerData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const cycle = getCycle();
      
  const { mutate, isPending } = useUpsertSeedSale({
    cycleId: cycle?.id!,
    saleId: venda?.id,
  });

  const onSubmit = async (data: SeedSaleFormData) => {
    if (!cycle?.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Nenhum ciclo de produção selecionado.",
      });
      return;
    }

    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: venda
            ? "Venda atualizada com sucesso!"
            : "Venda cadastrada com sucesso!",
        });
          
        onClose();
        form.reset();
      },
      onError: (error: Error) => {
        if (error instanceof ApiError) {
          if (error.status === 402) {
            showToast({
              type: "info",
              title: "Limite atingido",
              message: error.message,
            });
            return;
          }
            
        if (error.status === 401) {
          showToast({
            type: "info",
            title: "Sessão expirada",
            message: "Faça login novamente",
          });
          return;
        }
      }
      showToast({
        type: "error",
        title: "Erro",
        message: error.message,
      });
    },
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Venda</DialogTitle>
          <DialogDescription>
            {venda ? "Editar venda" : "Cadastrar venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cultivarId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cultivar</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cultivar" />
                          </SelectTrigger>
                          <SelectContent>
                            {cultivars.map((cultivar) => (
                              <SelectItem key={cultivar.id} value={cultivar.id}>
                                <div className="flex items-center gap-2">
                                  <span>{cultivar.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {`Estoque: ${cultivar.stock} kg`}
                                  </span>
                                </div>
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
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                <div className="flex items-center gap-2">
                                  <span>{customer.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {`${customer.cpf_cnpj}`}
                                  </span>
                                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Fiscal</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade (kg)" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="saleValue"
                  render={({ field }) => (
                    <MoneyInput label="Valor Total" field={field} />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? PaymentCondition.AVISTA}
                          onValueChange={(v) => field.onChange(v as PaymentCondition)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PaymentCondition.AVISTA}>À Vista</SelectItem>
                            <SelectItem value={PaymentCondition.APRAZO}>À Prazo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.getValues("paymentCondition") === PaymentCondition.APRAZO && (
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-green text-white mt-4"
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

export default UpsertSaleModal;
