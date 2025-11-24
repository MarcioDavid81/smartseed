"use client";

import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

// ===============================
// SMARTSEED MONEY INPUT (R$)
// ===============================

interface MoneyInputProps<T extends FieldValues> {
  label: string;
  field: ControllerRenderProps<T, any>;
  readonly?: boolean;
}

export function MoneyInput<T extends FieldValues>({
  label,
  field,
  readonly = false,
}: MoneyInputProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <FormControl>
        <NumericFormat
          customInput={Input}
          value={field.value}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          prefix="R$ "
          allowNegative={false}
          inputMode="numeric"
          valueIsNumericString
          className="font-light"
          onValueChange={(values) => {
            field.onChange(values.floatValue ?? 0);
          }}
          disabled={readonly}
        />
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}

// ===============================
// SMARTSEED QUANTITY INPUT (KG)
// ===============================

interface QuantityInputProps<T extends FieldValues> {
  label: string;
  field: ControllerRenderProps<T, any>;
  suffix?: string;
  readonly?: boolean;
  value?: number;
}

export function QuantityInput<T extends FieldValues>({
  label,
  field,
  suffix = "kg",
  readonly = false,
  value = 0,
}: QuantityInputProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <FormControl>
        <NumericFormat
          customInput={Input}
          value={field.value}
          thousandSeparator="."
          decimalSeparator="," 
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          suffix={` ${suffix}`}
          inputMode="numeric"
          valueIsNumericString
          className="font-light"
          onValueChange={(values) => {
            field.onChange(values.floatValue ?? 0);
          }}
          disabled={readonly}
          defaultValue={value}
        />
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}

// ===============================
// SMARTSEED PERCENT INPUT (0–100%)
// ===============================

interface PercentInputProps<T extends FieldValues> {
  label: string;
  field: ControllerRenderProps<T, any>;
}

export function PercentInput<T extends FieldValues>({
  label,
  field,
}: PercentInputProps<T>) {
  return (
    <FormItem>
      <FormLabel className="font-semibold text-sm">{label}</FormLabel>

      <FormControl>
        <NumericFormat
          customInput={Input}
          value={field.value}
          thousandSeparator="."
          decimalSeparator="," 
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          suffix=" %"
          inputMode="numeric"
          valueIsNumericString
          isAllowed={(values) => {
            const { floatValue } = values;
            return floatValue === undefined || (floatValue >= 0 && floatValue <= 100);
          }}
          className="font-light"
          onValueChange={(values) => {
            field.onChange(values.floatValue ?? 0);
          }}
        />
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}

