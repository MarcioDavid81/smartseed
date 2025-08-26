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
import { Unit } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

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
  unit: z.nativeEnum(Unit),
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
  const [totalPrice, setTotalPrice] = useState("");

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      date: compra
        ? new Date(compra.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      customerId: compra?.customerId ?? "",
      productId: compra?.productId ?? "",
      unit: compra?.unit ?? Unit.KG,
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
    const price = unitPrice;
    const qty = quantity;

    if (!isNaN(price) && !isNaN(qty)) {
      const total = price * qty;
      setTotalPrice(formatCurrency(total));
    } else {
      setTotalPrice("");
    }
  }, [unitPrice, quantity]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      date: compra ? new Date(compra.date).toISOString().split("T")[0] : "",
      customerId: compra?.customerId ?? "",
      productId: compra?.productId ?? "",
      unit: compra?.unit ?? Unit.KG,
      invoiceNumber: compra?.invoiceNumber ?? "",
      quantity: compra?.quantity ?? 0,
      unitPrice: compra?.unitPrice ?? 0,
      totalPrice: compra?.totalPrice ?? 0,
      farmId: compra?.farmId ?? "",
      notes: compra?.notes ?? "",
    },
  });

  useEffect(() => {
    if (compra) {
      reset({
        date: compra ? new Date(compra.date).toISOString().split("T")[0] : "",
        customerId: compra?.customerId ?? "",
        productId: compra?.productId ?? "",
        unit: compra?.unit ?? Unit.KG,
        invoiceNumber: compra?.invoiceNumber ?? "",
        quantity: compra?.quantity ?? 0,
        unitPrice: compra?.unitPrice ?? 0,
        totalPrice: compra?.totalPrice ?? 0,
        farmId: compra?.farmId ?? "",
        notes: compra?.notes ?? "",
      });
    } else {
      reset();
    }
  }, [compra, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [productRes, customerRes] = await Promise.all([
        fetch("/api/insumos/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const productData = await productRes.json();
      const customerData = await customerRes.json();

      setProducts(productData);
      setCustomers(customerData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: PurchaseFormData) => {
    setLoading(true);
    const token = getToken();

    const url = compra ? `/api/insumos/purchases/${compra.id}` : "/api/insumos/purchases";
    const method = compra ? "PUT" : "POST";

    const price = data.unitPrice;
    const quantity = data.quantity;
    const total = price * quantity;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        unitPrice: price,
        quantityKg: quantity,
        totalPrice: total,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar Compra.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        compra
          ? "Compra atualizada com sucesso!"
          : "Compra cadastrada com sucesso!",
        {
          style: {
            backgroundColor: "#63B926",
            color: "white",
          },
          icon: "✅",
        },
      );
      onClose();
      form.reset();
      setTotalPrice("");
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
                        {products.map((c) => (
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
                <FormField
                  control={form.control}
                  name="unitPrice"
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
                  name="quantity"
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
