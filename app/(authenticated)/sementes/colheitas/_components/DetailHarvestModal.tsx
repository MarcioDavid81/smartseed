"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Harvest } from "@/types";

interface Props {
  colheita: Harvest | null;
  onClose: () => void;
}

export function DetailHarvestModal({ colheita, onClose }: Props) {
  return (
    <Dialog open={!!colheita} onOpenChange={onClose}>
      <DialogContent className="animate-in fade-in-50 zoom-in-95">
        <DialogHeader>
          <DialogTitle>Detalhes da Operação</DialogTitle>
        </DialogHeader>
        {colheita && (
          <div className="space-y-2 text-sm">
            <p><strong>Talhão:</strong> {colheita.talhao.name}</p>
            <p><strong>Cultivar:</strong> {colheita.cultivar.name}</p>
            <p><strong>Data:</strong> {new Date(colheita.date).toLocaleDateString("pt-BR")}</p>
            <p><strong>Quantidade:</strong> {colheita.quantityKg} kg</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
