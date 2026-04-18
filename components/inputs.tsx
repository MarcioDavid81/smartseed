"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

function formatReverse(
  digits: string,
  decimalScale: number,
  options: { prefix?: string; suffix?: string } = {}
): string {
  const { prefix = "", suffix = "" } = options;
  const onlyDigits = digits.replace(/\D/g, "");

  if (onlyDigits === "") return "";

  const padded = onlyDigits.padStart(decimalScale + 1, "0");
  const intPart = padded.slice(0, padded.length - decimalScale) || "0";
  const decPart = decimalScale > 0 ? padded.slice(padded.length - decimalScale) : "";

  // Remove zeros à esquerda da parte inteira (mantém pelo menos 1 dígito)
  const intClean = intPart.replace(/^0+(?=\d)/, "");

  // Separador de milhar "."
  const intWithThousand = intClean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const formatted =
    decimalScale > 0 ? `${intWithThousand},${decPart}` : intWithThousand;

  return `${prefix}${formatted}${suffix}`;
}

function digitsToNumber(digits: string, decimalScale: number): number {
  const onlyDigits = digits.replace(/\D/g, "");
  if (onlyDigits === "") return 0;
  return Number(onlyDigits) / Math.pow(10, decimalScale);
}

function numberToDigits(value: number | undefined | null, decimalScale: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  if (value === 0) return "";
  const scaled = Math.round(Math.abs(value) * Math.pow(10, decimalScale));
  return String(scaled);
}

interface ReverseNumberInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  decimalScale: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  max?: number;
  min?: number;
  placeholder?: string;
  allowNegative?: boolean;
}

function ReverseNumberInput({
  value,
  onChange,
  decimalScale,
  prefix,
  suffix,
  disabled,
  className,
  max,
  min,
  placeholder,
  allowNegative = false,
}: ReverseNumberInputProps) {
  const [rawDigits, setRawDigits] = useState("");
  const [isNegative, setIsNegative] = useState(false);

  useEffect(() => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) {
      setRawDigits("");
      setIsNegative(false);
      return;
    }

    setRawDigits(numberToDigits(Math.abs(numeric), decimalScale));
    setIsNegative(allowNegative ? numeric < 0 : false);
  }, [allowNegative, decimalScale, value]);

  const display = useMemo(() => {
    if (rawDigits === "") {
      return allowNegative && isNegative ? "-" : "";
    }
    const formatted = formatReverse(rawDigits, decimalScale, { prefix, suffix });
    return allowNegative && isNegative ? `-${formatted}` : formatted;
  }, [allowNegative, decimalScale, isNegative, prefix, rawDigits, suffix]);

  const commit = (nextDigits: string, nextNegative = isNegative) => {
    const nextRawDigits = nextDigits.replace(/\D/g, "");
    const abs = digitsToNumber(nextRawDigits, decimalScale);
    const signed = allowNegative && nextNegative ? -abs : abs;

    if (max !== undefined && signed > max) return;
    if (min !== undefined && signed < min) return;

    setRawDigits(nextRawDigits);
    setIsNegative(allowNegative ? nextNegative : false);
    onChange(signed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDigits = e.target.value.replace(/\D/g, "");
    commit(nextDigits);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (rawDigits === "") {
        if (allowNegative && isNegative) {
          setIsNegative(false);
        }
        return;
      }
      commit(rawDigits.slice(0, -1));
      return;
    }

    if (e.key === "-" && allowNegative) {
      e.preventDefault();
      if (rawDigits === "") {
        setIsNegative((v) => !v);
        return;
      }
      commit(rawDigits, !isNegative);
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  );
}

// ===============================
// SMARTSEED MONEY INPUT (R$)
// ===============================

interface MoneyInputProps<T extends FieldValues> {
  label: string;
  field: ControllerRenderProps<T, any>;
  readonly?: boolean;
  onChange?: () => void;
  decimalScale?: number;
}

export function MoneyInput<T extends FieldValues>({
  label,
  field,
  readonly = false,
  onChange,
  decimalScale = 4,
}: MoneyInputProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <FormControl>
        <ReverseNumberInput
          value={field.value}
          decimalScale={decimalScale}
          placeholder="R$ 0,0000"
          prefix="R$ "
          disabled={readonly}
          className="font-light"
          min={0}
          onChange={(next) => {
            field.onChange(next);
            onChange?.();
          }}
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
  placeholder?: string;
  readonly?: boolean;
  value?: number;
  max?: number;
  decimalScale?: number;
}

export function QuantityInput<T extends FieldValues>({
  label,
  field,
  readonly = false,
  suffix,
  placeholder,
  max,
  decimalScale = 2,
}: QuantityInputProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <FormControl>
        <ReverseNumberInput
          value={field.value}
          decimalScale={decimalScale}
          placeholder={placeholder}
          suffix={suffix}
          disabled={readonly}
          className="font-light"
          max={max}
          allowNegative
          onChange={(next) => field.onChange(next)}
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
  placeholder?: string;
  decimalScale?: number;
}

export function PercentInput<T extends FieldValues>({
  label,
  field,
  placeholder,
  decimalScale = 2,
}: PercentInputProps<T>) {
  return (
    <FormItem>
      <FormLabel className="font-semibold text-sm">{label}</FormLabel>

      <FormControl>
        <ReverseNumberInput
          value={field.value}
          decimalScale={decimalScale}
          placeholder={placeholder}
          suffix=" %"
          className="font-light"
          min={0}
          max={100}
          onChange={(next) => field.onChange(next)}
        />
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}
