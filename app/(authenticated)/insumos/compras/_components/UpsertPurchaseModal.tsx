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
import { Insumo } from "@/types/insumo";
import { Purchase } from "@/types/purchase";
import { Customer } from "@/types/customers";
import { Farm } from "@/types/farm";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";
import { NumericFormat } from "react-number-format";

interface UpsertPurchaseModalProps {
  compra?: Purchase;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const purchaseSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  customerId: z.string().min(1, "Selecione um cliente"),
  productId: z.string().min(1, "Selecione um produto"),
  invoiceNumber: z.string().min(1, "Informe a nota fiscal"),
  quantity: z.coerce.number().min(1, "Quantidade é obrigatória"),
  unitPrice: z.coerce.number().min(1, "Preço unitário é obrigatório"),
  totalPrice: z.coerce.number().min(1, "Preço total é obrigatório"),
  farmId: z.string().min(1, "Selecione uma fazenda"),
  notes: z.string(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

const UpsertPurchaseModal = ({
  compra,
  isOpen,
  onClose,
  onUpdated,
}: UpsertPurchaseModalProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Insumo[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [totalPrice, setTotalPrice] = useState("");

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      date: compra
        ? new Date(compra.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      customerId: compra?.customerId ?? "",
      productId: compra?.productId ?? "",
      invoiceNumber: compra?.invoiceNumber ?? "",
      quantity: compra?.quantity ?? 0,
      unitPrice: compra?.unitPrice ?? 0,
      totalPrice: compra?.totalPrice ?? 0,
      farmId: compra?.farmId ?? "",
      notes: compra?.notes ?? "",
    },
  });

  const unitPrice = form.watch("unitPrice");
  const quantity = form.watch("quantity");

  useEffect(() => {
    if (!isNaN(unitPrice) && !isNaN(quantity)) {
      const total = unitPrice * quantity;
      setTotalPrice(formatCurrency(total));
    } else {
      setTotalPrice("");
    }
  }, [unitPrice, quantity]);

  useEffect(() => {
    if (compra) {
      form.reset({
        date: new Date(compra.date).toISOString().split("T")[0],
        customerId: compra.customerId,
        productId: compra.productId,
        invoiceNumber: compra.invoiceNumber,
        quantity: compra.quantity,
        unitPrice: compra.unitPrice,
        totalPrice: compra.totalPrice,
        farmId: compra.farmId,
        notes: compra.notes ?? "",
      });
    } else {
      form.reset();
    }
  }, [compra, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const [productRes, customerRes, farmRes] = await Promise.all([
        fetch("/api/insumos/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/farms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProducts(await productRes.json());
      setCustomers(await customerRes.json());
      setFarms(await farmRes.json());
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: PurchaseFormData) => {
    setLoading(true);
    const token = getToken();

    const url = compra
      ? `/api/insumos/purchases/${compra.id}`
      : "/api/insumos/purchases";
    const method = compra ? "PUT" : "POST";

    const total = data.unitPrice * data.quantity;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        quantityKg: data.quantity,
        totalPrice: total,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar Compra.", {
        style: { backgroundColor: "#F0C531", color: "white" },
        icon: "❌",
      });
    } else {
      toast.success(
        compra
          ? "Compra atualizada com sucesso!"
          : "Compra cadastrada com sucesso!",
        { style: { backgroundColor: "#63B926", color: "white" }, icon: "✅" },
      );
      onClose();
      form.reset();
      setTotalPrice("");
      onUpdated?.();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

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
              {/* Produto */}
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
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fornecedor */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
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
                {/* Data */}
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
                {/* Nota Fiscal */}
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

              <div className="grid grid-cols-2 gap-4">
                {/* Preço Unitário */}
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="R$ "
                          allowNegative={false}
                          value={field.value ?? ""}
                          onValueChange={(values) =>
                            field.onChange(values.floatValue ?? 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Quantidade */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(+e.target.value || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Valor Total */}
              <div>
                <label className="text-sm font-medium">Valor Total</label>
                <Input type="text" value={totalPrice} disabled />
              </div>

              {/* Fazenda */}
              <FormField
                control={form.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fazenda</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded border px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {farms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações */}
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

export default UpsertPurchaseModal;
