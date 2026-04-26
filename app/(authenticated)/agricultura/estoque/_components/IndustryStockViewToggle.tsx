"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "deposit" | "product";

interface Props {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function IndustryStockViewToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val as ViewMode)}
    >
      <ToggleGroupItem value="deposit" className="font-light">
        Por Deposósito
      </ToggleGroupItem>
      <ToggleGroupItem value="product" className="font-light">
        Por Produto
      </ToggleGroupItem>
    </ToggleGroup>
  );
}