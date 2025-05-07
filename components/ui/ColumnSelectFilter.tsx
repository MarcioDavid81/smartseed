"use client";

import { Table } from "@tanstack/react-table";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = {
  value: string;
  label: string;
};

interface ColumnSelectFilterProps<TData> {
  table: Table<TData>;
  columnId: string;
  options: Option[];
  placeholder?: string;
}

export function ColumnSelectFilter<TData>({
  table,
  columnId,
  options,
  placeholder = "Filtrar...",
}: ColumnSelectFilterProps<TData>) {
  const column = table.getColumn(columnId);
  const value = column?.getFilterValue() as string | undefined;

  return (
    <Select
      value={value || ""}
      onValueChange={(val) => {
        column?.setFilterValue(val || undefined);
      }}
    >
      <SelectTrigger className="w-[200px] mb-4">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Todos</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
