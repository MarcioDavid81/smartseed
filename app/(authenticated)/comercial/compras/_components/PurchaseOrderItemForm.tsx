"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ComboBoxOption } from "@/components/combo-option";
import { PurchaseOrderType, Unit } from "@prisma/client";
import { UseFormReturn } from "react-hook-form";
import { PurchaseOrderFormData } from "@/lib/schemas/purchaseOrderSchema";
import { FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Cultivar, Insumo } from "@/types";
import { getToken } from "@/lib/auth-client";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import { UNIT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/commercial";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PurchaseOrderItemFormProps {
  form: UseFormReturn<PurchaseOrderFormData>;
  index: number;
  onRemove: () => void;
  isOpen: boolean;
  orderType: PurchaseOrderType;
}

const PurchaseOrderItemForm = ({
  form,
  index,
  onRemove,
  isOpen,
  orderType,
}: PurchaseOrderItemFormProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [products, setProducts] = useState<Insumo[]>([]);

  const quantity = form.watch(`items.${index}.quantity`);
  const unityPrice = form.watch(`items.${index}.unityPrice`);
  const total = quantity * unityPrice || 0;
  form.setValue(`items.${index}.totalPrice`, total);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, productRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/insumos/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCultivars(await cultivarRes.json());
      setProducts(await productRes.json());
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Produto ou Cultivar conforme o tipo da ordem */}
        {orderType === PurchaseOrderType.INPUT_PURCHASE ? (
          <FormField
            control={form.control}
            name={`items.${index}.productId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto</FormLabel>
                <FormControl>
                  <ComboBoxOption
                    value={field.value}
                    onChange={field.onChange}
                    options={products.map((p) => ({
                      label: p.name,
                      value: p.id,
                    }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name={`items.${index}.cultivarId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cultivar</FormLabel>
                <FormControl>
                  <ComboBoxOption
                    value={field.value}
                    onChange={field.onChange}
                    options={cultivars.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Descrição */}
        <FormField
          control={form.control}
          name={`items.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Quantidade */}
        <FormField
          control={form.control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <QuantityInput label="Quantidade" field={field} />
          )}
        />

        {/* Unidade */}
        <FormField
          control={form.control}
          name={`items.${index}.unit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade de medida" />
                    </SelectTrigger>
                      <SelectContent>
                        {UNIT_TYPE_OPTIONS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

        {/* Preço unitário */}
        <FormField
          control={form.control}
          name={`items.${index}.unityPrice`}
          render={({ field }) => (
            <MoneyInput label="Preço Unitário" field={field} />
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <FormField
          control={form.control}
          name={`items.${index}.totalPrice`}
          render={({ field }) => (
            <MoneyInput label="Preço Total" field={field} readonly />
          )}
        />

        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
        >
          <FaTrash />
        </Button>
      </div>
    </div>
  );
};

export default PurchaseOrderItemForm;