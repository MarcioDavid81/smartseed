"use client";

import { Input } from "@/components/ui/input";

type PlateInputProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const formatPlate = (value: string) => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
};

export function PlateInput({
  value,
  onChange,
  placeholder = "ABC1D23",
  disabled,
}: PlateInputProps) {
  return (
    <Input
      value={value ?? ""}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => {
        const formatted = formatPlate(e.target.value);
        onChange(formatted);
      }}
    />
  );
}