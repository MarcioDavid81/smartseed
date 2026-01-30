"use client";

import { UNIT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/commercial";
import { ComboBoxOption } from "@/components/combo-option";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PurchaseOrderFormData } from "@/lib/schemas/purchaseOrderSchema";
import { useInputProductQuery } from "@/queries/input/use-input";
import { useSeedCultivarQuery } from "@/queries/seed/use-seed-cultivar-query";
import { PurchaseOrderType } from "@prisma/client";
import { Trash2Icon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";


interface PurchaseOrderItemFormProps {
  form: UseFormReturn<PurchaseOrderFormData>;
  index: number;
  onRemove: () => void;
  orderType: PurchaseOrderType;
}

const PurchaseOrderItemForm = ({
  form,
  index,
  onRemove,
  orderType,
}: PurchaseOrderItemFormProps) => {
  const quantity = form.watch(`items.${index}.quantity`);
  const unityPrice = form.watch(`items.${index}.unityPrice`);
  const total = quantity * unityPrice || 0;
  form.setValue(`items.${index}.totalPrice`, total);

  const { data: cultivars = [] } = useSeedCultivarQuery();
  const { data: products = [] } = useInputProductQuery();

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid grid-cols-5 gap-4">
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

        {/* Preço total */}
        <FormField
          control={form.control}
          name={`items.${index}.totalPrice`}
          render={({ field }) => (
            <MoneyInput label="Preço Total" field={field} readonly />
          )}
        />
      </div>

      <div className="grid grid-cols-10 gap-4 items-end">

        {/* Descrição */}
        <div className="col-span-9">
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
        </div>

        {/* Lixeira */}
        <div className="flex items-center mb-2 justify-center">
          <button
            type="button"
            onClick={onRemove}
            className="transition hover:opacity-80"
          >
            <Trash2Icon size={20} className="text-red-500" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PurchaseOrderItemForm;