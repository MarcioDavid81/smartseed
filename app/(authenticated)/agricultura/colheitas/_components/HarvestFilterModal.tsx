"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { SlidersHorizontal, X } from "lucide-react";

export interface HarvestFilters {
  farm: string;
  talhao: string;
  industryDeposit: string;
  document: string;
  transporter: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface HarvestFilterModalProps {
  filters: HarvestFilters;
  onApply: (filters: HarvestFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const emptyFilters: HarvestFilters = {
  farm: "",
  talhao: "",
  industryDeposit: "",
  document: "",
  transporter: "",
  dateFrom: null,
  dateTo: null,
};

export function HarvestFilterModal({
  filters,
  onApply,
  onClear,
  hasActiveFilters,
}: HarvestFilterModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HarvestFilters>(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(emptyFilters);
    onClear();
    setOpen(false);
  };

  const updateDraft = <K extends keyof HarvestFilters>(
    key: K,
    value: HarvestFilters[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative flex items-center gap-2 bg-gray-50 text-primary font-light"
        >
          <SlidersHorizontal size={16} />
          Filtrar
          {hasActiveFilters && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green text-xs text-white">
              !
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">Filtros</DialogTitle>
          <DialogDescription className="font-light">
            Utilize os campos abaixo para filtrar a lista de colheitas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Fazenda
            </label>
            <Input
              placeholder="Procure por fazenda"
              value={draft.farm}
              onChange={(e) => updateDraft("farm", e.target.value)}
              className="bg-gray-50 text-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Talhão
            </label>
            <Input
              placeholder="Procure por talhão"
              value={draft.talhao}
              onChange={(e) => updateDraft("talhao", e.target.value)}
              className="bg-gray-50 text-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Depósito
            </label>
            <Input
              placeholder="Procure por depósito"
              value={draft.industryDeposit}
              onChange={(e) => updateDraft("industryDeposit", e.target.value)}
              className="bg-gray-50 text-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Documento
            </label>
            <Input
              placeholder="Procure por documento"
              value={draft.document}
              onChange={(e) => updateDraft("document", e.target.value)}
              className="bg-gray-50 text-primary"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-primary">
              Transportador
            </label>
            <Input
              placeholder="Procure por transportador"
              value={draft.transporter}
              onChange={(e) => updateDraft("transporter", e.target.value)}
              className="bg-gray-50 text-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Data inicial
            </label>
            <DatePicker
              value={draft.dateFrom ?? undefined}
              onChange={(d) => updateDraft("dateFrom", d ?? null)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Data final
            </label>
            <DatePicker
              value={draft.dateTo ?? undefined}
              onChange={(d) => updateDraft("dateTo", d ?? null)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <X size={16} />
            Limpar filtros
          </Button>
          <Button type="button" onClick={handleApply} className="bg-green text-white">
            Aplicar filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
