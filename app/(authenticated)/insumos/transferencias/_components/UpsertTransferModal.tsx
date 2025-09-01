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
import { Farm, Insumo } from "@/types";
import { Transfer } from "@/types/transfer";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertTransferModalProps {
  transferencia?: Transfer;
  isOpen: boolean;
  onClose: () => void;
  onTransferCreated?: () => void;
  onUpdated?: () => void;
}

const transferenciaSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  productId: z.string().min(1, "Selecione um insumo"),
  quantity: z.coerce.number().min(1, "Quantidade é obrigatória"),
  originFarmId: z.string().min(1, "Selecione uma fazenda de origem"),
  destFarmId: z.string().min(1, "Selecione uma fazenda de destino"),
});

type TransferFormData = z.infer<typeof transferenciaSchema>;

const UpsertTransferModal = ({
  transferencia,
  isOpen,
  onClose,
  onTransferCreated,
  onUpdated,
}: UpsertTransferModalProps) => {
  const [loading, setLoading] = useState(false);
  const [insumo, setInsumo] = useState<Insumo[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      date: transferencia
        ? new Date(transferencia.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      productId: transferencia?.productId ?? "",
      quantity: transferencia?.quantity ?? 0,
      originFarmId: transferencia?.originFarmId ?? "",
      destFarmId: transferencia?.destFarmId ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      date: transferencia
        ? new Date(transferencia.date).toISOString().split("T")[0]
        : "",
      productId: transferencia?.productId ?? "",
      quantity: transferencia?.quantity ?? 0,
      originFarmId: transferencia?.originFarmId ?? "",
      destFarmId: transferencia?.destFarmId ?? "",
    },
  });

  useEffect(() => {
    if (transferencia) {
      reset({
        date: new Date(transferencia.date).toISOString().split("T")[0],
        productId: transferencia.productId,
        quantity: transferencia.quantity,
        originFarmId: transferencia.originFarmId,
        destFarmId: transferencia.destFarmId,
      });
    } else {
      reset();
    }
  }, [transferencia, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [farmRes, insumoRes] = await Promise.all([
        fetch("/api/farms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/insumos/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const farmData = await farmRes.json();
      const insumoData = await insumoRes.json();

      setFarms(farmData);
      setInsumo(insumoData);
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
      ? `/api/insumos/transfers/${transferencia.id}`
      : "/api/insumos/transfers";
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
      toast.warning(result.error || "Erro ao salvar plantio.", {
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
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {insumo.map((c) => (
                          <option key={c.id} value={c.id}>
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
                name="originFarmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito Origem</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {farms.map((c) => (
                          <option key={c.id} value={c.id}>
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
                name="destFarmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito Destino</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {farms.map((c) => (
                          <option key={c.id} value={c.id}>
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
              </div>

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

export default UpsertTransferModal;
