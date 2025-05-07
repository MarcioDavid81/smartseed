'use client'

import { useState } from 'react'
import { SquarePenIcon } from 'lucide-react'
import { EditCultivarModal } from './EditCultivarModal'
import { ProductType } from '@prisma/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Cultivar {
  id: string
  name: string
  product: ProductType
}

interface Props {
  cultivar: Cultivar
  onUpdated: () => void
}

const EditCultivarButton = ({ cultivar, onUpdated }: Props) =>  {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setOpen(true)}
                    className="hover:opacity-80 transition"
                  >
                    <SquarePenIcon size={20} className="text-green" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

      <EditCultivarModal
        isOpen={open}
        onClose={() => setOpen(false)}
        cultivar={cultivar}
        onUpdated={onUpdated}
      />
    </>
  )
}

export default EditCultivarButton
