"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { Farm, ProductStock, Talhao } from "@/types";
import { Application } from "@/types/application";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertApplicationModalProps {
  aplicacao?: Application;
  isOpen: boolean;
  onClose: () => void;
  onApplicationCreated?: () => void;
  onUpdated?: () => void;
}

const aplicacaoSchema = z.object({
  productStockId: z.string().min(1, "Selecione um insumo"),
  quantity: z.coerce.number().min(1, "Quantidade é obrigatória"),
  talhaoId: z.string().min(1, "Selecione um talhão"),
  date: z.date(),
  notes: z.string(),
});

type ApplicationFormData = z.infer<typeof aplicacaoSchema>;

const UpsertApplicationModal = ({
  aplicacao,
  isOpen,
  onClose,
  onApplicationCreated,
  onUpdated,
}: UpsertApplicationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [talhao, setTalhao] = useState<Talhao[]>([]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(aplicacaoSchema),
    defaultValues: {
      productStockId: aplicacao?.productStockId ?? "",
      talhaoId: aplicacao?.talhaoId ?? "",
      date: aplicacao ? new Date(aplicacao.date) : new Date(),
      quantity: aplicacao?.quantity ?? 0,
      notes: aplicacao?.notes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(aplicacaoSchema),
    defaultValues: {
      productStockId: aplicacao?.productStockId ?? "",
      talhaoId: aplicacao?.talhaoId ?? "",
      date: aplicacao ? new Date(aplicacao.date) : new Date(),
      quantity: aplicacao?.quantity ?? 0,
      notes: aplicacao?.notes ?? "",
    },
  });

  useEffect(() => {
    if (aplicacao) {
      reset({
        productStockId: aplicacao.productStockId,
        talhaoId: aplicacao.talhaoId,
        date: new Date(aplicacao.date),
        quantity: aplicacao.quantity,
        notes: aplicacao?.notes || "",
      });
    } else {
      reset();
    }
  }, [aplicacao, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [talhaoRes, farmRes, productStockRes] = await Promise.all([
        fetch("/api/plots", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/farms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/insumos/stock", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const talhaoData = await talhaoRes.json();
      const farmData = await farmRes.json();
      const productStockData = await productStockRes.json();

      setTalhao(talhaoData);
      setFarms(farmData);
      setProductStocks(productStockData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: ApplicationFormData) => {
    setLoading(true);
    const token = getToken();
    const cycle = getCycle();
    if (!cycle || !cycle.id) {
      toast.error("Nenhum ciclo de produção selecionado.");
      setLoading(false);
      return;
    }
    const cycleId = cycle.id;
    console.log("Dados enviados para API:", {
      ...data,
      cycleId,
    });

    const url = aplicacao ? `/api/insumos/applications/${aplicacao.id}` : "/api/insumos/applications";
    const method = aplicacao ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        cycleId,
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
        aplicacao
          ? "Aplicação atualizada com sucesso!"
          : "Aplicação cadastrada com sucesso!",
        {
          style: {
            backgroundColor: "#63B926",
            color: "white",
          },
          icon: "✅",
        }
      );
      onClose();
      reset();
      if (onApplicationCreated) onApplicationCreated();
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
          <DialogTitle>Aplicação</DialogTitle>
          <DialogDescription>
            {aplicacao ? "Editar aplicação" : "Cadastrar aplicação"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="productStockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="" className="text-sm font-light">Selecione</option>
                        {productStocks.map((c) => (
                          <option key={c.id} value={c.id} className="text-sm font-light">
                            {c.product.name}
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
                name="productStockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="" className="text-sm font-light">Selecione</option>
                        {productStocks.map((c) => (
                          <option key={c.id} value={c.id} className="text-sm font-light">
                            {c.farm.name}
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
                        <DatePicker value={field.value} onChange={field.onChange} />
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

              <FormField
                control={form.control}
                name="talhaoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talhão da Aplicação</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="" className="text-sm font-light">Selecione</option>
                        {talhao.map((c) => (
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green text-white mt-4"
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

export default UpsertApplicationModal;