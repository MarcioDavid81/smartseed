"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SmartComboboxProps {
  options: Option[];
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function ComboBoxOption({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Pesquisar...",
}: SmartComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState(0);

  // Filtrar somente quando tiver texto
  const filtered =
    search.length > 0
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  // Resetar cursor quando abrir popover
  useEffect(() => {
    if (open) setCursor(0);
  }, [open, search]);

  // 🎯 Listener de teclado (setas + enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = filtered[cursor];
      if (selected) {
        onChange(selected.value);
        setOpen(false);
        setSearch("");
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full justify-between rounded-md border bg-white px-3 py-2 text-left",
            "flex items-center text-sm",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? options.find((o) => o.value === value)?.label
            : placeholder}

          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 font-light">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown} // 🎯 Aqui entra o controle de teclado
          />

          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          {search.length > 0 && (
            <CommandGroup>
              {filtered.map((opt, index) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  className={cn(
                    "cursor-pointer",
                    index === cursor && "bg-accent text-accent-foreground" // Destaque do cursor
                  )}
                  onMouseEnter={() => setCursor(index)}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      opt.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
