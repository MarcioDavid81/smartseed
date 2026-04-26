"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "farm" | "product";

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
      <ToggleGroupItem value="farm" className="font-light">
        Por Fazenda
      </ToggleGroupItem>
      <ToggleGroupItem value="product" className="font-light">
        Por Produto
      </ToggleGroupItem>
    </ToggleGroup>
  );
}