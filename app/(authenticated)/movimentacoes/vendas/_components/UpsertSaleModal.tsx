"use client";

import { formatCurrency } from "@/app/_helpers/currency";
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
import { Cultivar } from "@/types";
import { Customer } from "@/types/customers";
import { Sale } from "@/types/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertSaleModalProps {
  venda?: Sale;
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void;
  onUpdated?: () => void;
}

const saleSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  customerId: z.string().min(1, "Selecione um talhão"),
  date: z.string().min(1, "Selecione uma data"),
  invoiceNumber: z.string().min(1, "Informe a nota fiscal"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  saleValue: z.coerce.number().min(1, "Preço total é obrigatório"),
  notes: z.string(),
});

type SaleFormData = z.infer<typeof saleSchema>;

const UpsertSaleModal = ({
  venda,
  isOpen,
  onClose,
  onHarvestCreated,
  onUpdated,
}: UpsertSaleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      cultivarId: venda?.cultivarId ?? "",
      customerId: venda?.customerId ?? "",
      date: venda
        ? new Date(venda.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      invoiceNumber: venda?.invoiceNumber ?? "",
      saleValue: venda?.saleValue ?? 0,
      quantityKg: venda?.quantityKg ?? 0,
      notes: venda?.notes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      cultivarId: venda?.cultivarId ?? "",
      customerId: venda?.customerId ?? "",
      date: venda ? new Date(venda.date).toISOString().split("T")[0] : "",
      invoiceNumber: venda?.invoiceNumber ?? "",
      saleValue: venda?.saleValue ?? 0,
      quantityKg: venda?.quantityKg ?? 0,
      notes: venda?.notes ?? "",
    },
  });

  useEffect(() => {
    if (venda) {
      reset({
        cultivarId: venda.cultivarId,
        customerId: venda.customerId,
        date: new Date(venda.date).toISOString().split("T")[0],
        invoiceNumber: venda.invoiceNumber,
        saleValue: venda.saleValue,
        quantityKg: venda.quantityKg,
        notes: venda.notes || "",
      });
    } else {
      reset();
    }
  }, [venda, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, customerRes] = await Promise.all([
        fetch("/api/cultivars/get", {
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

  const onSubmit = async (data: SaleFormData) => {
    console.log(" 📦 Data enviada:", data);
    setLoading(true);
    const token = getToken();

    const url = venda ? `/api/sales/${venda.id}` : "/api/sales";
    const method = venda ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao salvar Venda.");
    } else {
      toast.success(
        venda
          ? "Venda atualizada com sucesso!"
          : "Venda cadastrada com sucesso!"
      );
      onClose();
      reset();
      if (onHarvestCreated) onHarvestCreated();
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
          <DialogTitle>Venda</DialogTitle>
          <DialogDescription>
            {venda ? "Editar venda" : "Cadastrar venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="cultivarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cultivar</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {cultivars.map((c) => (
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
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {customers.map((c) => (
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
                  name="quantityKg"
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
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Fiscal</FormLabel>
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
                  name="saleValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="Ex: R$10.000,00" />
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

export default UpsertSaleModal;
