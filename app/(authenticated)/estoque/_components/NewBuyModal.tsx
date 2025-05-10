"use client";

import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getToken } from "@/lib/auth-client";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { formatCurrency } from "@/app/_helpers/currency";

const formSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  customerId: z.string().min(1, "Selecione um fornecedor"),
  date: z.string(),
  invoice: z.string().min(1, "Informe a nota fiscal"),
  unityPrice: z.string().min(1, "Informe o preço unitário"),
  quantityKg: z.string().min(1, "Informe a quantidade"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Cultivar = { id: string; name: string };
type Customer = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void;
};

export default function NewBuyModal({
  isOpen,
  onClose,
  onHarvestCreated,
}: Props) {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const unityPrice = form.watch("unityPrice");
  const quantityKg = form.watch("quantityKg");

  useEffect(() => {
    const price = parseFloat((unityPrice || "0").replace(/\D/g, "")) / 100;
    const qty = parseFloat(quantityKg || "0".replace(",", "."));

    if (!isNaN(price) && !isNaN(qty)) {
      const total = price * qty;
      setTotalPrice(formatCurrency(total));
    } else {
      setTotalPrice("");
    }
  }, [unityPrice, quantityKg]);

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

  const onSubmit = async (data: FormValues) => {
    const token = getToken();
    setLoading(true);

    try {
      const unity = parseFloat(data.unityPrice.replace(/\D/g, "")) / 100;
      const qty = parseFloat(data.quantityKg.replace(",", "."));
      const total = unity * qty;

      const response = await fetch("/api/buys", {
        method: "POST",
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

      if (!response.ok) throw new Error("Erro ao salvar compra");

      toast.success("Compra cadastrada com sucesso!");
      onClose();
      form.reset();
      setTotalPrice("");

      if (onHarvestCreated) onHarvestCreated();
    } catch (error) {
      toast.error("Erro ao salvar compra");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Compra</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <NumericFormat
                        {...field}
                        customInput={Input}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        allowNegative={false}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.formattedValue);
                        }}
                      />
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
              className="w-full bg-green text-white"
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
