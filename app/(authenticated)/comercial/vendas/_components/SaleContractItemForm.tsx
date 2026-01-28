"use client";

import { UNIT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/commercial";
import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
import { ComboBoxOption } from "@/components/combo-option";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import { Button } from "@/components/ui/button";
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
import { SaleContractFormData } from "@/lib/schemas/saleContractSchema";
import { useInputProductQuery } from "@/queries/input/use-input";
import { useSeedCultivarQuery } from "@/queries/seed/use-seed-cultivar-query";
import { PurchaseOrderType, SaleContractType } from "@prisma/client";
import { UseFormReturn } from "react-hook-form";
import { FaTrash } from "react-icons/fa";

interface SaleContractItemFormProps {
  form: UseFormReturn<SaleContractFormData>;
  index: number;
  onRemove: () => void;
  orderType: SaleContractType;
}

const SaleContractItemForm = ({
  form,
  index,
  onRemove,
  orderType,
}: SaleContractItemFormProps) => {
  const quantity = form.watch(`items.${index}.quantity`);
  const unityPrice = form.watch(`items.${index}.unityPrice`);
  const total = quantity * unityPrice || 0;
  form.setValue(`items.${index}.totalPrice`, total);

  const { data: cultivars = [] } = useSeedCultivarQuery();

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Produto ou Cultivar conforme o tipo da ordem */}
        {orderType === SaleContractType.INDUSTRY_SALE ? (
          <FormField
            control={form.control}
            name={`items.${index}.product`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto</FormLabel>
                <FormControl>
                  <ComboBoxOption
                    value={field.value}
                    onChange={field.onChange}
                    options={PRODUCT_TYPE_OPTIONS.map((p) => ({
                      label: p.label,
                      value: p.value,
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

export default SaleContractItemForm;
