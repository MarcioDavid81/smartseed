"use client";

import { formatNumber } from "@/app/_helpers/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Harvest } from "@/types";
import HoverButton from "@/components/HoverButton";

interface Props {
  colheita: Harvest | null;
  onClose: () => void;
}

export function DetailHarvestModal({ colheita, onClose }: Props) {
  return (
    <Dialog open={!!colheita} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Colheita</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {colheita && (
            <motion.div
              key={colheita.id as string}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="flex flex-wrap items-center gap-2"
              >
                <Badge variant="default" className="text-xs bg-green text-white hover:bg-green/90">Talhão: {colheita.talhao.name}</Badge>
                <Badge variant="outline" className="text-xs">Cultivar: {colheita.cultivar.name}</Badge>
              </motion.div>

              <Separator className="opacity-60" />

              <div className="rounded-md bg-muted/40 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {new Date(colheita.date).toLocaleDateString("pt-BR")}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="font-medium">
                      {formatNumber(Number(colheita.quantityKg))} kg
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="flex justify-end">
                <HoverButton onClick={onClose}>
                  Fechar
                </HoverButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
