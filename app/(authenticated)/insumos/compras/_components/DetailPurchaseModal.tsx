"use client";

import { formatCurrency, formatNumber } from "@/app/_helpers/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import HoverButton from "@/components/HoverButton";
import { format } from "date-fns";
import { Purchase } from "@/types/purchase";

interface Props {
  compra: Purchase | null;
  onClose: () => void;
}

export function DetailPurchaseModal({ compra, onClose }: Props) {
  return (
    <Dialog open={!!compra} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Compra</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {compra && (
            <motion.div
              key={compra.id as string}
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
                <Badge variant="default" className="text-xs bg-green text-white hover:bg-green/90">
                  Fornecedor: {compra.customer.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Produto: {compra.product.name}
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
                      {new Date(compra.date).toLocaleDateString("pt-BR")}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Documento</p>
                    <p className="font-medium">
                      {compra.invoiceNumber}
                    </p>
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Preço Unitário</p>
                    <p className="font-medium">
                      {formatCurrency(compra.unitPrice)}
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
                      {formatNumber(Number(compra.quantity))} {compra.product.unit}
                    </p>
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="font-medium">
                      {formatCurrency(compra.totalPrice)}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Condição de Pagamento</p>
                    <p className="font-medium">
                      {compra.paymentCondition === "AVISTA" ? "À Vista" : "À Prazo"}
                    </p>
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Vencimento</p>
                    <p className="font-medium">
                      {compra.accountPayable?.dueDate
                        ? format(new Date(compra.accountPayable.dueDate), "dd/MM/yyyy")
                        : "—"}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">Status do Pagamento</p>
                    <p className="font-medium">
                      <Badge
                        className={
                          compra.accountPayable?.status === "PENDING"
                            ? "bg-yellow-500 text-white rounded-full text-xs font-light"
                            : "bg-green text-white rounded-full text-xs font-light"
                        }
                      >
                        {compra.accountPayable?.status === "PENDING" ? "Pendente" : "Pago"}
                      </Badge>
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
