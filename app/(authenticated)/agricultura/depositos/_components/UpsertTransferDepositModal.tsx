"use client";

import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
import { formatNumber } from "@/app/_helpers/currency";
import { QuantityInput } from "@/components/inputs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import { CreateIndustryTransferFormData, createIndustryTransferSchema } from "@/lib/schemas/industryTransferSchema";
import { useIndustryDeposits } from "@/queries/industry/use-deposits-query";
import { useUpsertIndustryTransfer } from "@/queries/industry/use-upsert-industry-transfer";
import { IndustryTransfer } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertTransferDepositModalProps {
  transferencia?: IndustryTransfer;
  isOpen: boolean;
  onClose: () => void;
}


const UpsertTransferDepositModal = ({
  transferencia,
  isOpen,
  onClose,
}: UpsertTransferDepositModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<CreateIndustryTransferFormData>({
    resolver: zodResolver(createIndustryTransferSchema),
    defaultValues: {
      date: transferencia ? new Date(transferencia.date) : new Date(),
      product: transferencia?.product || undefined,
      fromDepositId: transferencia?.fromDepositId ?? "",
      toDepositId: transferencia?.toDepositId ?? "",
      quantity: transferencia?.quantity ?? 0,
      document: transferencia?.document ?? "",
      observation: transferencia?.observation ?? "",
    },
  });

  useEffect(() => {
    if (transferencia) {
      form.reset({
        date: transferencia.date ? new Date(transferencia.date) : new Date(),
        product: transferencia.product,
        fromDepositId: transferencia.fromDepositId,
        toDepositId: transferencia.toDepositId,
        quantity: transferencia.quantity,
        document: transferencia.document,
        observation: transferencia.observation,
      });
    } else {
      form.reset();
    }
  }, [transferencia, isOpen, form]);

  const { data: deposits = [] } = useIndustryDeposits();

  const selectedProduct = form.watch("product");
  const availableDeposits = deposits
  .map((deposit) => {
    const stock = deposit.industryStocks?.find(
      (s) => s.product === selectedProduct && s.quantity > 0
    );

    if (!stock) return null;

    return {
      id: deposit.id,
      name: deposit.name,
      quantity: stock.quantity,
    };
  })
  .filter(Boolean);

  const { mutate, isPending } = useUpsertIndustryTransfer({
    transferId: transferencia?.id,
  });

  const onSubmit = async (data: CreateIndustryTransferFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: transferencia
            ? "Transferência atualizada com sucesso!"
            : "Transferência cadastrada com sucesso!",
        });
        onClose();
        form.reset();
      },
      onError: (error) => {
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
          message: error.message || "Erro ao salvar transferência.",
        });
      },
    });
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[calc(100%-1rem)] sm:w-full max-h-[95vh] overflow-scroll scrollbar-hide rounded-2xl">
        <DialogHeader>
          <DialogTitle>Transferência</DialogTitle>
          <DialogDescription>
            {transferencia ? "Editar transferência" : "Cadastrar transferência"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">     
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produto</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_TYPE_OPTIONS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
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
                  name="fromDepositId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito Origem</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedProduct}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !selectedProduct
                                ? "Selecione um produto primeiro"
                                : availableDeposits.length === 0
                                ? "Sem estoque disponível"
                                : "Selecione um depósito"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                          {availableDeposits.map((deposit) => (
                            <SelectItem key={deposit?.id || ""} value={deposit?.id || ""}>
                              <div className="flex justify-between gap-2 w-full">
                                <span>{deposit?.name || ""}</span>
                                <span className="text-muted-foreground">
                                  {formatNumber(deposit?.quantity || 0)} kg
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} suffix=" Kg" />
                  )}
                />
                <FormField
                  control={form.control}
                  name="toDepositId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito Destino</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um depósito" />
                          </SelectTrigger>
                          <SelectContent>
                            {deposits.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
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

              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="mt-4 w-full bg-green text-white"
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

export default UpsertTransferDepositModal;
