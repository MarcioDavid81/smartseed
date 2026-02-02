"use client";

import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
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
import { Textarea } from "@/components/ui/textarea";
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
      product: transferencia?.product ?? ProductType.SOJA,
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
      <DialogContent className="sm:max-w-[425px]">
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
                <div>
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
                </div>
                <div>
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
                </div>
              </div>
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

              <div className="grid grid-cols-2 gap-4">                
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} suffix=" kg" />
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
              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
