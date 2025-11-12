"use client";

import { formatNumber } from "@/app/_helpers/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import HoverButton from "@/components/HoverButton";
import { Beneficiation } from "@/types";

interface Props {
  descarte: Beneficiation | null;
  onClose: () => void;
}

export function DetailBeneficiationModal({ descarte, onClose }: Props) {
  return (
    <Dialog open={!!descarte} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Descarte</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {descarte && (
            <motion.div
              key={descarte.id as string}
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
                <Badge variant="default"  className="text-xs bg-green text-white hover:bg-green/90">
                  Cultivar: {descarte.cultivar.name}
                </Badge>
              </motion.div>

              <Separator className="opacity-60" />

              <div className="rounded-md bg-muted/40 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {new Date(descarte.date).toLocaleDateString("pt-BR")}
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
                      {formatNumber(descarte.quantityKg)} kg
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Destino</p>
                    <p className="font-medium">
                      {descarte.destination?.name || "Nenhum"}
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
