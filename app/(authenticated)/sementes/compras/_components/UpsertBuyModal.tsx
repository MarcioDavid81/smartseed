"use client";

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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth-client";
import { Buy, Cultivar } from "@/types";
import { Customer } from "@/types/customers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { getCycle } from "@/lib/cycle";
import { PaymentCondition, ProductType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuyFormData, seedBuySchema } from "@/lib/schemas/seedBuyScheema";
import { useSmartToast } from "@/contexts/ToastContext";
import { useUpsertSeedBuy } from "@/queries/seed/use-upsert-seed-buy";
import { ApiError } from "@/lib/http/api-error";
import { DatePicker } from "@/components/ui/date-picker";
import { MoneyInput, QuantityInput } from "@/components/inputs";

interface UpsertBuyModalProps {
  compra?: Buy;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertBuyModal = ({
  compra,
  isOpen,
  onClose,
}: UpsertBuyModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<BuyFormData>({
    resolver: zodResolver(seedBuySchema),
    defaultValues: {
      cultivarId: compra?.cultivarId ?? "",
      customerId: compra?.customerId ?? "",
      date: compra ? new Date(compra.date) : new Date(),
      invoice: compra?.invoice ?? "",
      unityPrice: compra?.unityPrice ?? 0,
      totalPrice: compra?.totalPrice ?? 0,
      quantityKg: compra?.quantityKg ?? 0,
      notes: compra?.notes ?? "",
      paymentCondition: compra?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: compra?.dueDate 
        ? new Date(compra.dueDate) 
        : new Date(),
    },
  });

  const unityPrice = Number(form.watch("unityPrice") ?? 0);
  const quantityKg = Number(form.watch("quantityKg") ?? 0);

  useEffect(() => {
    const total = unityPrice * quantityKg;
    form.setValue("totalPrice", Number.isFinite(total) ? parseFloat(total.toFixed(2)) : 0);
  }, [unityPrice, quantityKg]);

  useEffect(() => {
    if (compra) {
      form.reset({
        cultivarId: compra.cultivarId,
        customerId: compra.customerId,
        date: compra ? new Date(compra.date) : new Date(),
        invoice: compra.invoice,
        unityPrice: compra.unityPrice,
        totalPrice: compra.totalPrice,
        quantityKg: compra.quantityKg,
        notes: compra.notes || "",
        paymentCondition: compra.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: compra.dueDate
          ? new Date(compra.dueDate)
          : new Date(),
      });
    } else {
      form.reset();
    }
  }, [compra, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const cycle = getCycle();
      if (!cycle || !cycle.productType) {
        toast.error("Nenhum ciclo de produção selecionado.");
        return;
      }

      const [cultivarRes, customerRes] = await Promise.all([
        fetch(`/api/cultivars/available-for-harvest?productType=${cycle.productType as ProductType}`, {
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
    
  const { mutate, isPending } = useUpsertSeedBuy({
    cycleId: cycle?.id!,
    buyId: compra?.id,
  });

  const onSubmit = async (data: BuyFormData) => {
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
          message: compra
            ? "Compra atualizada com sucesso!"
            : "Compra cadastrada com sucesso!",
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

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Compra</DialogTitle>
          <DialogDescription>
            {compra ? "Editar compra" : "Cadastrar compra"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cultivarId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Cultivar</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma cultivar" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className="flex items-center gap-2">
                                <span>{customer.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {`CPF/CNPJ: ${customer.cpf_cnpj}`}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="invoice"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantidade (kg) */}
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade (kg)" field={field} />
                  )}
                />
                {/* Preço Unitário */}
                <FormField
                  control={form.control}
                  name="unityPrice"
                  render={({ field }) => (
                    <MoneyInput label="Preço Unitário" field={field} />
                  )}
                />
                {/* Preço Total */}
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <MoneyInput label="Preço Total" field={field} readonly />
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
                {form.watch("paymentCondition") === PaymentCondition.APRAZO && (
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
                className="mt-4 w-full bg-green text-white hover:bg-green/90"
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

export default UpsertBuyModal;
