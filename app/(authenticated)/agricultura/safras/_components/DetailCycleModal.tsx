"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import HoverButton from "@/components/HoverButton";
import { Cycle } from "@/types/cycles";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  safra: Cycle | null;
  onClose: () => void;
}

export function DetailCycleModal({ safra, onClose }: Props) {
  return (
    <Dialog open={!!safra} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Safra</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {safra && (
            <motion.div
              key={safra.id as string}
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
                  Safra: {safra.name}
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
                    <p className="text-xs text-muted-foreground">Data de Início</p>
                    <p className="font-medium">
                      {new Date(safra.startDate).toLocaleDateString("pt-BR")}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Data de Encerramento</p>
                    <p className="font-medium">
                      {new Date(safra.endDate).toLocaleDateString("pt-BR")}
                    </p>
                  </motion.div>
                </div>
                <div>
                  <ScrollArea className="h-[200px]">
                    <p className="text-sm text-muted-foreground">Talhões relacionados</p>
                    <ul className="list-disc list-inside">
                      {safra.talhoes.map((talhao) => (
                        <li key={talhao.id}>
                          {talhao.talhao.name}
                          <span className="text-xs font-light text-muted-foreground ml-2">
                            ({talhao.talhao.area} ha)
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Total de área: {safra.talhoes.reduce((acc, cur) => acc + cur.talhao.area, 0)} ha
                    </p>
                  </ScrollArea>
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
