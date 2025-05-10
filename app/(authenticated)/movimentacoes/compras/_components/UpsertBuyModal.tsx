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
import { Buy, Cultivar } from "@/types";
import { Customer } from "@/types/customers";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertBuyModalProps {
  compra?: Buy;
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void;
  onUpdated?: () => void;
}

const buySchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  customerId: z.string().min(1, "Selecione um talhão"),
  date: z.string().min(1, "Selecione uma data"),
  invoice: z.string().min(1, "Informe a nota fiscal"),
  unityPrice: z.coerce.number().min(1, "Preço unitário é obrigatório"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  notes: z.string(),
});

type BuyFormData = z.infer<typeof buySchema>;

const UpsertBuyModal = ({
  compra,
  isOpen,
  onClose,
  onHarvestCreated,
  onUpdated,
}: UpsertBuyModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPrice, setTotalPrice] = useState("");

  const form = useForm<BuyFormData>({
    resolver: zodResolver(buySchema),
    defaultValues: {
      cultivarId: compra?.cultivarId ?? "",
      customerId: compra?.customerId ?? "",
      date: compra
        ? new Date(compra.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      invoice: compra?.invoice ?? "",
      unityPrice: compra?.unityPrice ?? 0,
      quantityKg: compra?.quantityKg ?? 0,
      notes: compra?.notes ?? "",
    },
  });

  const unityPrice = form.watch("unityPrice");
  const quantityKg = form.watch("quantityKg");

  useEffect(() => {
    const price = unityPrice;
    const qty = quantityKg;

    if (!isNaN(price) && !isNaN(qty)) {
      const total = price * qty;
      setTotalPrice(formatCurrency(total));
    } else {
      setTotalPrice("");
    }
  }, [unityPrice, quantityKg]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuyFormData>({
    resolver: zodResolver(buySchema),
    defaultValues: {
      cultivarId: compra?.cultivarId ?? "",
      customerId: compra?.customerId ?? "",
      date: compra ? new Date(compra.date).toISOString().split("T")[0] : "",
      invoice: compra?.invoice ?? "",
      unityPrice: compra?.unityPrice ?? 0,
      quantityKg: compra?.quantityKg ?? 0,
      notes: compra?.notes ?? "",
    },
  });

  useEffect(() => {
    if (compra) {
      reset({
        cultivarId: compra.cultivarId,
        customerId: compra.customerId,
        date: new Date(compra.date).toISOString().split("T")[0],
        invoice: compra.invoice,
        unityPrice: compra.unityPrice,
        quantityKg: compra.quantityKg,
        notes: compra.notes || "",
      });
    } else {
      reset();
    }
  }, [compra, isOpen, reset]);

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

  const onSubmit = async (data: BuyFormData) => {
    console.log(" 📦 Data enviada:", data);
    setLoading(true);
    const token = getToken();

    const url = compra ? `/api/buys/${compra.id}` : "/api/buys";
    const method = compra ? "PUT" : "POST";

    const unity = data.unityPrice;
    const qty = data.quantityKg;
    const total = unity * qty;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        unityPrice: unity,
        quantityKg: qty,
        totalPrice: total,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao salvar Compra.");
    } else {
      toast.success(
        compra
          ? "Compra atualizada com sucesso!"
          : "Compra cadastrada com sucesso!"
      );
      onClose();
      form.reset();
      setTotalPrice("");
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
          <DialogTitle>Compra</DialogTitle>
          <DialogDescription>
            {compra ? "Editar compra" : "Cadastrar compra"}
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
                    <FormLabel>Fornecedor</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unityPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário</FormLabel>
                      <FormControl>
                        {/* <NumericFormat
                          {...field}
                          customInput={Input}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="R$ "
                          allowNegative={false}
                          value={field.value}
                          onValueChange={(values) => {
                            const value = values.floatValue;
                            field.onChange(
                              typeof value === "number" ? value : 0
                            );
                          }}
                        /> */}
                        <Input {...field} type="text" placeholder="Ex: 10.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade (kg)</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Ex: 1000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Valor Total</label>
                <Input type="text" value={totalPrice} disabled />
              </div>

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

export default UpsertBuyModal;
