"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "product" | "farm";

interface Props {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function StockViewToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val as ViewMode)}
    >
      <ToggleGroupItem value="product" className="font-light">
        Por Produto
      </ToggleGroupItem>
      <ToggleGroupItem value="farm" className="font-light">
        Por Fazenda
      </ToggleGroupItem>
    </ToggleGroup>
  );
}