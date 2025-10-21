"use client";

import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
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
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { IndustryDeposit, IndustryTransfer } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@prisma/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertTransferDepositModalProps {
  transferencia?: IndustryTransfer;
  isOpen: boolean;
  onClose: () => void;
  onTransferCreated?: () => void;
  onUpdated?: () => void;
}

const transferDepositSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  product: z.nativeEnum(ProductType),
  fromDepositId: z.string().cuid(),
  toDepositId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  document: z.string().optional(),
  observation: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferDepositSchema>;

const UpsertTransferDepositModal = ({
  transferencia,
  isOpen,
  onClose,
  onTransferCreated,
  onUpdated,
}: UpsertTransferDepositModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferDepositSchema),
    defaultValues: {
      date: transferencia
        ? new Date(transferencia.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      product: transferencia?.product ?? ProductType.SOJA,
      fromDepositId: transferencia?.fromDepositId ?? "",
      toDepositId: transferencia?.toDepositId ?? "",
      quantity: transferencia?.quantity ?? 0,
      document: transferencia?.document ?? "",
      observation: transferencia?.observation ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferDepositSchema),
    defaultValues: {
      date: transferencia
        ? new Date(transferencia.date).toISOString().split("T")[0]
        : "",
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
      reset({
        date: new Date(transferencia.date).toISOString().split("T")[0],
        product: transferencia.product,
        fromDepositId: transferencia.fromDepositId,
        toDepositId: transferencia.toDepositId,
        quantity: transferencia.quantity,
        document: transferencia.document,
        observation: transferencia.observation,
      });
    } else {
      reset();
    }
  }, [transferencia, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const depositRes = await fetch("/api/industry/deposit", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const depositData = await depositRes.json();

      setDeposits(depositData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: TransferFormData) => {
    setLoading(true);
    const token = getToken();
    console.log("Dados enviados para API:", {
      ...data,
    });

    const url = transferencia
      ? `/api/industry/transfer/${transferencia.id}`
      : "/api/industry/transfer";
    const method = transferencia ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar transferência.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        transferencia
          ? "Transferência atualizada com sucesso!"
          : "Transferência cadastrada com sucesso!",
        {
          style: {
            backgroundColor: "#63B926",
            color: "white",
          },
          icon: "✅",
        },
      );
      onClose();
      reset();
      if (onTransferCreated) onTransferCreated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

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
              <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="" className="text-sm font-light">Selecione</option>
                        {PRODUCT_TYPE_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value} className="text-sm font-light">
                            {c.label}
                          </option>
                        ))}
                      </select>
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
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="" className="text-sm font-light">Selecione</option>
                        {deposits.map((c) => (
                          <option key={c.id} value={c.id} className="text-sm font-light">
                            {c.name}
                          </option>
                        ))}
                      </select>
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
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="" className="text-sm font-light">Selecione</option>
                        {deposits.map((c) => (
                          <option key={c.id} value={c.id} className="text-sm font-light">
                            {c.name}
                          </option>
                        ))}
                      </select>
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
                    <FormItem>
                      <FormLabel>Quantidade (Kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-green text-white"
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransferDepositModal;
