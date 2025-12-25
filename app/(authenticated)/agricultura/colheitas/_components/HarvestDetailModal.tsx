"use client"

import { AgroLoader } from "@/components/agro-loader"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useIndustryHarvest } from "@/queries/industry/use-harvest-query"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Discount, Info } from "./Auxiliares"

interface HarvestDetailsModalProps {
  harvestId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}


export function HarvestDetailsModal({
  harvestId,
  open,
  onOpenChange,
}: HarvestDetailsModalProps) {
  const { data, isLoading } = useIndustryHarvest(harvestId)
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100%-1rem)] sm:w-full max-h-[95vh] overflow-hidden rounded-2xl">
        {isLoading && <AgroLoader />}

        {data && (
          <div className="overflow-y-auto scrollbar-hide max-h-[calc(95vh-3rem)] pr-1">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* HEADER */}
            <motion.div variants={item} className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Colheita de {data.product}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(data.date), "dd/MM/yyyy")}
                </p>
              </div>

              <Badge variant="secondary">
                Documento #{data.document}
              </Badge>
            </motion.div>

            <Separator />

            {/* HERO */}
            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="rounded-xl border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">Peso Líquido</p>
                <p className="text-2xl font-bold">
                  {Number(data.weightLiq).toLocaleString("pt-BR")} kg
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Fazenda</p>
                <p className="font-medium">{data.talhao.farm.name}</p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Talhão</p>
                <p className="font-medium">{data.talhao.name}</p>
              </div>
            </motion.div>

            {/* LOGÍSTICA */}
            <motion.div variants={item}>
              <h3 className="font-semibold mb-2">Logística</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Info label="Placa" value={data.truckPlate} />
                <Info label="Motorista" value={data.truckDriver} />
                <Info label="Transportador" value={data.industryTransporter?.name} />
                <Info label="Depósito" value={data.industryDeposit?.name} />
              </div>
            </motion.div>

            {/* DESCONTOS */}
            <motion.div variants={item}>
              <h3 className="font-semibold mb-2">Descontos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Discount
                  label="Umidade"
                  percent={data.humidity_percent}
                  kg={data.humidity_kg}
                />
                <Discount
                  label="Impurezas"
                  percent={data.impurities_discount}
                  kg={data.impurities_kg}
                />
                <Info label="Taxas" value={`${data.tax_kg} kg`} />
                <Info label="Ajuste" value={`${data.adjust_kg} kg`} />
              </div>
            </motion.div>

            {/* PESAGENS */}
            <motion.div variants={item}>
              <h3 className="font-semibold mb-2">Pesagens</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Info label="Peso Bruto" value={`${data.weightBt} kg`} />
                <Info label="Tara" value={`${data.weightTr} kg`} />
                <Info label="Sub-líquido" value={`${data.weightSubLiq} kg`} />
                <Info
                  label="Líquido"
                  value={`${data.weightLiq} kg`}
                  highlight
                />
              </div>
            </motion.div>
          </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}